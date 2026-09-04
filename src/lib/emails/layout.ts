import { SITE_NAME, SUPPORT_EMAIL, APP_URL } from "./constants";

const INK = "#10222c";
const INK_MUTED = "#6b7680";
const BORDER = "#e5e2dc";
const PAPER = "#f7f5f1";

export function emailLayout({ previewText, bodyHtml }: { previewText: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SITE_NAME}</title>
  </head>
  <body style="margin:0; padding:0; background:${PAPER}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
    <span style="display:none; font-size:0; line-height:0; max-height:0; max-width:0; opacity:0; overflow:hidden;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border:1px solid ${BORDER}; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:28px 32px; border-bottom:1px solid ${BORDER};">
                <span style="font-size:18px; font-weight:700; letter-spacing:-0.01em; color:${INK};">${SITE_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid ${BORDER}; font-size:12px; color:${INK_MUTED};">
                <p style="margin:0 0 4px;">${SITE_NAME} — <a href="${APP_URL}" style="color:${INK_MUTED};">${APP_URL.replace(/^https?:\/\//, "")}</a></p>
                <p style="margin:0;">Besoin d'aide ? Écrivez-nous à <a href="mailto:${SUPPORT_EMAIL}" style="color:${INK_MUTED};">${SUPPORT_EMAIL}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:6px; background:${INK};"><a href="${href}" style="display:inline-block; padding:13px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">${label}</a></td></tr></table>`;
}

export const emailTextStyles = {
  ink: INK,
  inkMuted: INK_MUTED,
  border: BORDER,
};
