import { sendEmail } from "@/lib/plunk";
import { EMAIL_FROM, SUPPORT_EMAIL } from "./constants";
import {
  welcomeEmailTemplate,
  orderConfirmationEmailTemplate,
  orderPreparingEmailTemplate,
  orderShippedEmailTemplate,
  orderDeliveredEmailTemplate,
  orderCancelledEmailTemplate,
  passwordResetEmailTemplate,
  adminInviteEmailTemplate,
  contactMessageEmailTemplate,
  extraPaymentEmailTemplate,
  type OrderEmailData,
} from "./templates";

// Automatic emails must never break the flow that triggers them (signup, order
// status change, etc.) — especially while the sending domain isn't verified in
// Plunk yet. Every sender here catches and logs instead of throwing.
async function safeSend(to: string, template: { subject: string; html: string }) {
  try {
    await sendEmail({
      to,
      subject: template.subject,
      body: template.html,
      from: EMAIL_FROM.email,
      name: EMAIL_FROM.name,
    });
  } catch (error) {
    console.error(`[emails] Échec de l'envoi de "${template.subject}" à ${to}:`, error);
  }
}

export function sendWelcomeEmail(to: string, name: string | null) {
  return safeSend(to, welcomeEmailTemplate(name));
}

export function sendOrderConfirmationEmail(to: string, name: string | null, order: OrderEmailData) {
  return safeSend(to, orderConfirmationEmailTemplate(name, order));
}

export function sendOrderPreparingEmail(to: string, name: string | null, order: OrderEmailData) {
  return safeSend(to, orderPreparingEmailTemplate(name, order));
}

export function sendOrderShippedEmail(to: string, name: string | null, order: OrderEmailData) {
  return safeSend(to, orderShippedEmailTemplate(name, order));
}

export function sendOrderDeliveredEmail(to: string, name: string | null, order: OrderEmailData) {
  return safeSend(to, orderDeliveredEmailTemplate(name, order));
}

export function sendOrderCancelledEmail(to: string, name: string | null, order: OrderEmailData) {
  return safeSend(to, orderCancelledEmailTemplate(name, order));
}

export function sendPasswordResetEmail(to: string, name: string | null, resetUrl: string) {
  return safeSend(to, passwordResetEmailTemplate(name, resetUrl));
}

export function sendAdminInviteEmail(to: string, name: string | null, setPasswordUrl: string) {
  return safeSend(to, adminInviteEmailTemplate(name, setPasswordUrl));
}

export function sendExtraPaymentEmail(
  to: string,
  name: string | null,
  payment: { orderId: string; label: string; amountCents: number; currency: string; checkoutUrl: string }
) {
  return safeSend(to, extraPaymentEmailTemplate(name, payment));
}

export function sendContactMessageEmail(name: string, fromEmail: string, message: string) {
  return safeSend(SUPPORT_EMAIL, contactMessageEmailTemplate(name, fromEmail, message));
}
