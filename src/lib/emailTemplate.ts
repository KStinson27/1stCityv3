import { SITE_URL } from "@/lib/site";

export type EmailField = { label: string; value: string; href?: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converts bare newlines to <br> after escaping, for free-text blocks (messages, notes). */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function fieldsTable(fields: EmailField[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
    ${fields
      .map(
        (f) => `<tr>
          <td style="padding:6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#9e9e9e;width:140px;vertical-align:top;">${escapeHtml(f.label)}</td>
          <td style="padding:6px 0;font-size:14px;color:#212121;">${
            f.href
              ? `<a href="${escapeHtml(f.href)}" style="color:#2e7d32;text-decoration:none;">${escapeHtml(f.value)}</a>`
              : escapeHtml(f.value)
          }</td>
        </tr>`,
      )
      .join("")}
  </table>`;
}

/**
 * Renders a branded HTML email (table-based layout, inline styles only —
 * email clients, especially Outlook, don't reliably support external/
 * embedded stylesheets or modern CSS). Mirrors the site's own palette
 * (src/app/globals.css) rather than pulling it in directly.
 */
export function renderEmailHtml(options: {
  heading: string;
  intro?: string;
  fields?: EmailField[];
  message?: { label: string; body: string };
  /** Repeated sub-cards, each with its own field list — for digest-style emails (e.g. several waitlist signups at once). */
  items?: { title: string; fields: EmailField[] }[];
  cta?: { label: string; url: string };
  footerNote?: string;
}): string {
  const { heading, intro, fields, message, items, cta, footerNote } = options;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden;">
            <tr>
              <td style="background:#1b5e20;padding:20px 28px;">
                <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:.02em;">1st City LLC</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#212121;">${escapeHtml(heading)}</h1>
                ${intro ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#616161;">${escapeMultiline(intro)}</p>` : ""}
                ${fields && fields.length > 0 ? fieldsTable(fields) : ""}
                ${
                  message
                    ? `<div style="margin:0 0 20px;">
                        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#9e9e9e;margin-bottom:6px;">${escapeHtml(message.label)}</div>
                        <div style="background:#f5f5f5;border-radius:4px;padding:14px;font-size:14px;line-height:1.6;color:#212121;white-space:pre-wrap;">${escapeMultiline(message.body)}</div>
                      </div>`
                    : ""
                }
                ${
                  items && items.length > 0
                    ? items
                        .map(
                          (item, i) => `<div style="border:1px solid #e0e0e0;border-radius:4px;padding:14px 16px;margin:0 0 ${i === items.length - 1 ? "20" : "12"}px;">
                            <div style="font-size:14px;font-weight:700;color:#212121;margin-bottom:8px;">${escapeHtml(item.title)}</div>
                            ${fieldsTable(item.fields)}
                          </div>`,
                        )
                        .join("")
                    : ""
                }
                ${
                  cta
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 4px;">
                        <tr>
                          <td style="background:#2e7d32;border-radius:4px;">
                            <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#ffffff;text-decoration:none;">${escapeHtml(cta.label)}</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #e0e0e0;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#9e9e9e;">
                  ${footerNote ? escapeHtml(footerNote) : "This is an automated message from the 1st City LLC website."}
                  ${SITE_URL.startsWith("https://") ? ` <a href="${escapeHtml(SITE_URL)}" style="color:#9e9e9e;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</a>` : ""}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
