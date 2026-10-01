"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { effectivePriceCents } from "@/lib/pricing";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { CheckoutFormSchema, type CheckoutFormState } from "@/lib/definitions";
import { APP_URL } from "@/lib/emails/constants";
import { MINUTE, clientIp, rateLimit } from "@/lib/rate-limit";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

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
      qty: z.number().int().min(1).max(20),
    })
  )
  .min(1)
  .max(30);

export async function createCheckoutSession(
  cartItems: CheckoutCartItem[],
  _state: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const parsedCart = CheckoutCartSchema.safeParse(cartItems);
  if (!parsedCart.success) {
    return {
      message:
        cartItems.length === 0
          ? "Votre panier est vide."
          : "Votre panier contient un article invalide. Retirez-le puis réessayez.",
    };
  }

  const validatedFields = CheckoutFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  if (!isStripeConfigured()) {
    return { message: "Le paiement en ligne n'est pas encore disponible. Merci de revenir un peu plus tard." };
  }

  if (!(await rateLimit(`checkout:ip:${await clientIp()}`, 10, 10 * MINUTE))) {
    return { message: "Trop de tentatives de paiement. Réessayez dans quelques minutes." };
  }

  const { name, email, phone, address, city, postalCode, country } = validatedFields.data;

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
      return { message: "Un article de votre panier n'est plus disponible." };
    }
    const sizeRow = product.sizes.find((s) => s.size === item.size);
    if (!sizeRow || sizeRow.stock < item.qty) {
      return { message: `Stock insuffisant pour "${product.name}" (taille ${item.size}).` };
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
  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
  const totalCents = subtotalCents + shippingCents;

  const session = await auth();

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
                  product_data: { name: "Livraison" },
                },
              },
            ]
          : []),
      ],
      metadata: { orderId: order.id },
      // Stripe substitue {CHECKOUT_SESSION_ID} : la page de confirmation s'en sert
      // pour vérifier que le visiteur est bien celui qui a payé.
      success_url: `${APP_URL}/commande/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout?order=${order.id}`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });
    checkoutSessionUrl = checkoutSession.url;
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    console.error("[checkout] Échec de la création de la session Stripe:", error);
    return { message: "Le paiement n'a pas pu être initié. Réessayez dans quelques instants." };
  }

  if (!checkoutSessionUrl) {
    await prisma.order.delete({ where: { id: order.id } });
    return { message: "Le paiement n'a pas pu être initié. Réessayez dans quelques instants." };
  }

  redirect(checkoutSessionUrl);
}
