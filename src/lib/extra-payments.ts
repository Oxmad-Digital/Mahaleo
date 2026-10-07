/**
 * Lien permanent d'un paiement complémentaire. Une session Stripe Checkout
 * expire au bout de 24 h : le lien envoyé au client pointe donc vers le site,
 * qui ouvre une session neuve à chaque visite.
 */
export function extraPaymentUrl(paymentId: string) {
  return `/paiement/${paymentId}`;
}
