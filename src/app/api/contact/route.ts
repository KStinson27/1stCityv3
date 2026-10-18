import { NextResponse } from "next/server";
import { contactApiSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { checkRecaptcha } from "@/lib/recaptcha";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { recaptchaToken, website, ...message } = parsed.data;

  // Honeypot: a real user never fills this in. Pretend success without
  // writing anything or sending an email, so bots get no useful signal.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!(await checkRecaptcha(recaptchaToken))) {
    return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
  }

  await prisma.contactSubmission.create({
    data: {
      name: message.name,
      email: message.email,
      phone: message.phone || null,
      message: message.message,
    },
  });

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
      // Don't fail the request over an email delivery issue — the
      // submission is already saved and visible in /admin.
    }
  } else {
    console.info("RESEND_API_KEY not set — no email sent; submission saved to /admin.");
  }

  return NextResponse.json({ ok: true });
}
