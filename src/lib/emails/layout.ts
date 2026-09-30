import { SITE_NAME, SUPPORT_EMAIL, APP_URL, EMAIL_ASSET_URL } from "./constants";

// Tokens du design system rétro (cf. globals.css, `--retro-*`).
const PAPER = "#eee6d1";
const PAPER_LIGHT = "#f5eedb";
const INK = "#332f26";
const RED = "#bd3020";
const LINE = "#bdb299";
const MUTED = "#766e5b";
const ON_RED = "#fff8e9";

const SANS = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const DISPLAY = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";

export const LOGO_URL = `${EMAIL_ASSET_URL}/images/email/logo-mahaleo.png`;

export function emailLayout({ previewText, bodyHtml }: { previewText: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${SITE_NAME}</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0; padding:0; background:${PAPER}; color:${INK}; font-family:${SANS};">
    <span style="display:none; font-size:0; line-height:0; max-height:0; max-width:0; opacity:0; overflow:hidden;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}; padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:${PAPER_LIGHT}; border:1px solid ${LINE};">
            <tr>
              <td style="padding:10px 28px; border-bottom:1px solid ${LINE}; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:${MUTED};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family:${SANS}; font-size:10px; letter-spacing:1.5px; color:${MUTED};">ANTSIRABE · MADAGASCAR</td>
                    <td align="right" style="font-family:${SERIF}; font-size:10px; letter-spacing:1.5px; color:${MUTED};">DEPUIS 1972</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:26px 28px 22px; border-bottom:3px double ${LINE};">
                <a href="${APP_URL}" style="text-decoration:none;"><img src="${LOGO_URL}" width="200" height="47" alt="${SITE_NAME}" style="display:block; width:200px; height:auto; border:0; color:${RED}; font:700 28px ${DISPLAY};" /></a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 36px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 22px; border-top:3px double ${LINE}; font-family:${SERIF}; font-style:italic; font-size:12px; line-height:1.6; color:${MUTED};">
                <p style="margin:0 0 4px;">Besoin d'aide ? Écrivez-nous à <a href="mailto:${SUPPORT_EMAIL}" style="color:${INK};">${SUPPORT_EMAIL}</a></p>
                <p style="margin:0;"><a href="${APP_URL}" style="color:${MUTED};">${APP_URL.replace(/^https?:\/\//, "")}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function heading(kicker: string, title: string) {
  return `<p style="margin:0 0 10px; font-family:${SANS}; font-size:11px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:${RED};">${kicker}</p>
      <h1 style="margin:0 0 20px; font-family:${DISPLAY}; font-size:38px; font-weight:700; line-height:1; letter-spacing:-.2px; text-transform:uppercase; color:${INK};">${title}</h1>`;
}

export function paragraph(html: string, { last = false } = {}) {
  return `<p style="margin:0 0 ${last ? 0 : 12}px; font-family:${SANS}; font-size:15px; line-height:1.6; color:${INK};">${html}</p>`;
}

export function note(html: string) {
  return `<p style="margin:20px 0 0; font-family:${SERIF}; font-style:italic; font-size:14px; line-height:1.6; color:${MUTED};">${html}</p>`;
}

export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;"><tr><td style="background:${RED};"><a href="${href}" style="display:inline-block; padding:14px 26px; font-family:${SANS}; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${ON_RED}; text-decoration:none;">${label}</a></td></tr></table>`;
}

export const emailStyles = {
  ink: INK,
  red: RED,
  muted: MUTED,
  line: LINE,
  sans: SANS,
  serif: SERIF,
  display: DISPLAY,
};
