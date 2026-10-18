/**
 * SendGrid, via a single verified sender (krystal.stinson@1stcityllc.com)
 * rather than a verified sending domain — the team doesn't control DNS
 * for 1stcityllc.com, and SendGrid's single-sender verification works
 * without it (unlike Resend, which requires a verified domain).
 */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = "krystal.stinson@1stcityllc.com";

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
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
        content: [{ type: "text/plain", value: options.text }],
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
