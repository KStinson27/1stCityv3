/**
 * SendGrid, sending as a domain-authenticated address on 1stcityllc.net
 * (SPF/DKIM via SendGrid's Domain Authentication) rather than
 * 1stcityllc.com — nobody on the team has DNS access for .com, but
 * 1stcityllc.net's DNS is reachable. Single-sender verification alone
 * (no domain authentication) isn't enough: major providers like Gmail
 * reject unauthenticated mail with a 550, even though SendGrid itself
 * accepts the API call.
 */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = "website@1stcityllc.net";

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  /** Branded HTML version (see src/lib/emailTemplate.ts). Optional — falls back to plain text alone when omitted. */
  html?: string;
  fromName?: string;
  /** Logged if SENDGRID_API_KEY isn't set, in place of the generic message below. */
  skippedContext?: string;
}): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.info(
      options.skippedContext ??
        `SENDGRID_API_KEY not set — no email sent to ${options.to} ("${options.subject}").`
    );
    return;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: SENDER_EMAIL, name: options.fromName ?? "1st City LLC Website" },
        subject: options.subject,
        content: options.html
          ? [
              { type: "text/plain", value: options.text },
              { type: "text/html", value: options.html },
            ]
          : [{ type: "text/plain", value: options.text }],
      }),
    });
    if (!response.ok) {
      console.error(`SendGrid email to ${options.to} failed (${response.status}):`, await response.text());
    }
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    // Don't throw — callers already saved the underlying data (a
    // submission, a reset token) and shouldn't fail the request over a
    // delivery issue.
  }
}
