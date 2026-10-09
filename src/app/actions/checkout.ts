"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { effectivePriceCents } from "@/lib/pricing";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { CheckoutFormSchema, type CheckoutFields, type CheckoutFormState } from "@/lib/definitions";
import { APP_URL } from "@/lib/emails/constants";
import { MINUTE, clientIp, rateLimit } from "@/lib/rate-limit";
import { MAX_QTY_PER_LINE, SHIPPING_COUNTRY_CODES } from "@/lib/shipping";
import { findShippingOption, quoteShipping, type ShippingOption } from "@/lib/shipping-quote";
import { SendcloudError, getServicePoint } from "@/lib/sendcloud";
import { deleteAbandonedOrders } from "@/lib/abandoned-orders";
import { ORDERS_CLOSED_MESSAGE, ORDERS_OPEN } from "@/lib/orders-open";

// Durée de validité d'une session Stripe Checkout (30 min est le minimum
// accepté). Courte, elle limite la fenêtre pendant laquelle un panier peut être
// payé alors que le stock a été vendu entre-temps.
const CHECKOUT_SESSION_TTL_SECONDS = 30 * 60;

export type CheckoutCartItem = {
  productId: string;
  size?: string;
  qty: number;
};

// Le panier vient du navigateur (localStorage, lié à l'action par `.bind`) : il
// est entièrement contrôlable par le client et doit être revalidé ici.
const CheckoutCartSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(64),
      size: z.string().min(1).max(32),
      qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
    })
  )
  .min(1)
  .max(30);

export type CheckoutShippingQuote = {
  options: ShippingOption[];
  /** Clé publique d'intégration attendue par le widget point relais Sendcloud. */
  servicePointApiKey: string | null;
};

/**
 * Tarifs domicile et point relais affichés au checkout pour le pays et le
 * nombre d'articles. Indicatif : `createCheckoutSession` refait le calcul.
 */
export async function getShippingQuote(country: string, itemCount: number): Promise<CheckoutShippingQuote> {
  const parsed = z
    .object({ country: z.enum(SHIPPING_COUNTRY_CODES), itemCount: z.number().int().min(1).max(30 * MAX_QTY_PER_LINE) })
    .safeParse({ country, itemCount });
  const options = await quoteShipping(parsed.success ? parsed.data.country : "FR", parsed.success ? parsed.data.itemCount : 1);
  return {
    options,
    servicePointApiKey: options.some((option) => option.mode === "SERVICE_POINT")
      ? (process.env.SENDCLOUD_PUBLIC_KEY ?? null)
      : null,
  };
}

function formatServicePointAddress(point: { street: string; house_number: string; postal_code: string; city: string }) {
  return `${[point.house_number, point.street].filter(Boolean).join(" ")}, ${point.postal_code} ${point.city}`;
}

function cartErrorMessage(cartItems: CheckoutCartItem[]) {
  if (cartItems.length === 0) return "Votre panier est vide.";
  if (cartItems.some((item) => item.qty > MAX_QTY_PER_LINE)) {
    return `Vous pouvez commander au maximum ${MAX_QTY_PER_LINE} exemplaires d'une même taille. Ajustez la quantité dans votre panier.`;
  }
  if (cartItems.some((item) => !item.size)) {
    return "Un article de votre panier n'a pas de taille. Retirez-le puis ajoutez-le à nouveau depuis sa fiche.";
  }
  return "Votre panier contient un article invalide. Retirez-le puis réessayez.";
}

export async function createCheckoutSession(
  cartItems: CheckoutCartItem[],
  _state: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const text = (key: string) => String(formData.get(key) ?? "");
  const fields: CheckoutFields = {
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    postalCode: text("postalCode"),
    country: text("country"),
    terms: formData.get("terms") === "on",
  };
  const delivery = {
    shippingOption: text("shippingOption"),
    servicePointId: text("servicePointId"),
    servicePointPostNumber: text("servicePointPostNumber"),
  };

  if (!ORDERS_OPEN) {
    return { fields, message: ORDERS_CLOSED_MESSAGE };
  }

  const parsedCart = CheckoutCartSchema.safeParse(cartItems);
  if (!parsedCart.success) {
    return { fields, message: cartErrorMessage(cartItems) };
  }

  const validatedFields = CheckoutFormSchema.safeParse({
    ...fields,
    ...delivery,
    terms: formData.get("terms") ?? undefined,
  });

  if (!validatedFields.success) {
    return { fields, errors: validatedFields.error.flatten().fieldErrors };
  }

  if (!isStripeConfigured()) {
    return { fields, message: "Le paiement en ligne n'est pas encore disponible. Merci de revenir un peu plus tard." };
  }

  if (!(await rateLimit(`checkout:ip:${await clientIp()}`, 10, 10 * MINUTE))) {
    return { fields, message: "Trop de tentatives de paiement. Réessayez dans quelques minutes." };
  }

  const { name, email, phone, address, city, postalCode, country, shippingOption, servicePointId, servicePointPostNumber } =
    validatedFields.data;

  // Une même taille ajoutée deux fois au panier ne fait qu'une ligne : le
  // contrôle de stock porte sur la quantité totale.
  const lines = new Map<string, { productId: string; size: string; qty: number }>();
  for (const item of parsedCart.data) {
    const key = `${item.productId}|${item.size}`;
    const existing = lines.get(key);
    if (existing) existing.qty += item.qty;
    else lines.set(key, { ...item });
  }

  const productIds = [...new Set([...lines.values()].map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { sizes: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const orderLines: {
    productId: string;
    size: string;
    quantity: number;
    priceCents: number;
    name: string;
    image?: string;
  }[] = [];
  for (const item of lines.values()) {
    const product = productById.get(item.productId);
    if (!product) {
      return { fields, message: "Un article de votre panier n'est plus disponible. Retournez au panier pour le mettre à jour." };
    }
    const sizeRow = product.sizes.find((s) => s.size === item.size);
    if (!sizeRow || sizeRow.stock <= 0) {
      return { fields, message: `« ${product.name} » en taille ${item.size} est épuisé. Retirez-le de votre panier.` };
    }
    if (sizeRow.stock < item.qty) {
      return {
        fields,
        message: `Il ne reste que ${sizeRow.stock} exemplaire(s) de « ${product.name} » en taille ${item.size}. Ajustez la quantité dans votre panier.`,
      };
    }
    const unitPriceCents = effectivePriceCents(product);
    orderLines.push({
      productId: product.id,
      size: item.size,
      quantity: item.qty,
      priceCents: unitPriceCents,
      name: product.name,
      image: product.images[0],
    });
  }

  const subtotalCents = orderLines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  // Le tarif est recalculé ici à partir de Sendcloud : seul le mode choisi
  // vient du navigateur.
  const itemCount = orderLines.reduce((sum, line) => sum + line.quantity, 0);
  const rate = findShippingOption(await quoteShipping(country, itemCount), shippingOption);
  if (!rate) {
    return {
      fields,
      errors: { shippingOption: ["Ce mode de livraison n'est plus disponible pour votre commande. Choisissez-en un autre."] },
    };
  }
  if (rate.mode === "SERVICE_POINT" && !servicePointId) {
    return { fields, errors: { servicePointId: ["Choisissez un point de retrait."] } };
  }

  let servicePoint: { id: number; name: string; address: string; postNumber: string | null } | null = null;
  if (rate.mode === "SERVICE_POINT" && servicePointId) {
    try {
      const point = await getServicePoint(servicePointId);
      // Le point doit correspondre au transporteur et au type de point de la
      // méthode facturée : l'étiquette n'accepte que les points de son réseau.
      if (
        !point.is_active ||
        (point.general_shop_type === "locker") !== (rate.pointKind === "locker") ||
        point.country !== country ||
        point.carrier !== rate.carrier
      ) {
        return {
          fields,
          errors: { servicePointId: ["Ce point de retrait ne correspond pas au mode choisi ou n'est plus disponible. Choisissez-en un autre."] },
        };
      }
      servicePoint = {
        id: point.id,
        name: point.name,
        address: formatServicePointAddress(point),
        postNumber: servicePointPostNumber ?? null,
      };
    } catch (error) {
      if (!(error instanceof SendcloudError)) console.error("[checkout] Vérification du point relais:", error);
      return { fields, message: "Le point relais n'a pas pu être vérifié. Réessayez dans quelques instants." };
    }
  }

  const shippingCents = rate.rateCents;
  const totalCents = subtotalCents + shippingCents;
  const shippingLabel = `Livraison · ${rate.label}`;

  const session = await auth();

  // Ménage des paiements abandonnés dont la session Stripe a expiré, au cas où
  // l'événement `checkout.session.expired` ne serait pas parvenu au webhook.
  await deleteAbandonedOrders().catch((error) => console.error("[checkout] Nettoyage des commandes abandonnées:", error));

  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id,
      status: "PENDING",
      totalCents,
      currency: "EUR",
      customerName: name,
      customerEmail: email,
      phone,
      shippingAddress: address,
      shippingCity: city,
      shippingPostalCode: postalCode,
      shippingCountry: country,
      deliveryMode: rate.mode,
      shippingMethodId: rate.methodId,
      shippingMethodName: rate.methodName,
      shippingCarrier: rate.carrier,
      servicePointId: servicePoint?.id,
      servicePointName: servicePoint?.name,
      servicePointAddress: servicePoint?.address,
      servicePointPostNumber: servicePoint?.postNumber,
      items: {
        create: orderLines.map((line) => ({
          productId: line.productId,
          size: line.size,
          quantity: line.quantity,
          priceCents: line.priceCents,
        })),
      },
    },
  });

  const stripe = getStripe();
  let checkoutSessionUrl: string | null;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        ...orderLines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "eur",
            unit_amount: line.priceCents,
            product_data: {
              name: `${line.name} · ${line.size}`,
              images: line.image ? [line.image] : undefined,
            },
          },
        })),
        ...(shippingCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "eur",
                  unit_amount: shippingCents,
                  product_data: { name: shippingLabel },
                },
              },
            ]
          : []),
      ],
      metadata: { orderId: order.id },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
      locale: "fr",
      // Stripe substitue {CHECKOUT_SESSION_ID} : la page de confirmation s'en sert
      // pour vérifier que le visiteur est bien celui qui a payé.
      success_url: `${APP_URL}/commande/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });
    checkoutSessionUrl = checkoutSession.url;
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    console.error("[checkout] Échec de la création de la session Stripe:", error);
    return { fields, message: "Le paiement n'a pas pu être initié. Réessayez dans quelques instants." };
  }

  if (!checkoutSessionUrl) {
    await prisma.order.delete({ where: { id: order.id } });
    return { fields, message: "Le paiement n'a pas pu être initié. Réessayez dans quelques instants." };
  }

  redirect(checkoutSessionUrl);
}
