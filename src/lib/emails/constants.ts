export const SITE_NAME = "Mahaleo";
export const SUPPORT_EMAIL = "contact@mahaleo.shop";

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export const EMAIL_FROM = {
  email: process.env.PLUNK_FROM_EMAIL ?? "no-reply@mahaleo.shop",
  name: SITE_NAME,
};
