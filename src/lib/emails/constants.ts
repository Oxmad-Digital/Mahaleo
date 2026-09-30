export const SITE_NAME = "Mahaleo";
export const SUPPORT_EMAIL = "contact@mahaleo.shop";

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Les images d'un e-mail sont chargées par le client mail, jamais depuis
// localhost : hors production, elles pointent vers le site public.
export const EMAIL_ASSET_URL = APP_URL.startsWith("https://") ? APP_URL : "https://www.mahaleo.shop";

export const EMAIL_FROM = {
  email: process.env.PLUNK_FROM_EMAIL ?? "no-reply@mahaleo.shop",
  name: SITE_NAME,
};
