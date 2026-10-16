import { NextResponse } from "next/server";
import { contactApiSchema } from "@/lib/validation";

async function verifyRecaptcha(token: string | undefined, secretKey: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Failed to verify reCAPTCHA:", error);
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { recaptchaToken, ...message } = parsed.data;
  const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (recaptchaSecretKey) {
    const verified = await verifyRecaptcha(recaptchaToken, recaptchaSecretKey);
    if (!verified) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = "detroit1stcity@1stcityllc.com";

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "1st City LLC Website <notifications@1stcityllc.example>",
          to: notifyEmail,
          subject: "General inquiry from website",
          text: [
            `From: ${message.name} <${message.email}>`,
            `Phone: ${message.phone || "(not provided)"}`,
            "",
            message.message,
          ].join("\n"),
        }),
      });
    } catch (error) {
      console.error("Failed to send contact email:", error);
    }
  } else {
    console.info("RESEND_API_KEY not set — inquiry logged instead of emailed:", message);
  }

  return NextResponse.json({ ok: true });
}
