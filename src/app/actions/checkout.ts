"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { CheckoutFormSchema, type CheckoutFormState } from "@/lib/definitions";
import { APP_URL } from "@/lib/emails/constants";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

export type CheckoutCartItem = {
  productId: string;
  size?: string;
  qty: number;
};

export async function createCheckoutSession(
  cartItems: CheckoutCartItem[],
  _state: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  if (cartItems.length === 0) {
    return { message: "Votre panier est vide." };
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

  const { name, email, phone, address, city, postalCode, country } = validatedFields.data;

  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { sizes: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const orderLines: { productId: string; quantity: number; priceCents: number; name: string; image?: string }[] = [];
  for (const item of cartItems) {
    const product = productById.get(item.productId);
    if (!product) {
      return { message: "Un article de votre panier n'est plus disponible." };
    }
    if (item.size) {
      const sizeRow = product.sizes.find((s) => s.size === item.size);
      if (!sizeRow || sizeRow.stock < item.qty) {
        return { message: `Stock insuffisant pour "${product.name}" (taille ${item.size}).` };
      }
    }
    const unitPriceCents = product.onSale && product.salePriceCents != null ? product.salePriceCents : product.priceCents;
    orderLines.push({
      productId: product.id,
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
              name: line.name,
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
      success_url: `${APP_URL}/commande/confirmation?order=${order.id}`,
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
