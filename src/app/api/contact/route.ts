import { NextResponse } from "next/server";
import { contactApiSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { checkRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/email";
import { renderEmailHtml } from "@/lib/emailTemplate";
import { SITE_URL } from "@/lib/site";

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

  await sendEmail({
    to: "detroit1stcity@1stcityllc.com",
    subject: "General inquiry from website",
    text: [
      `From: ${message.name} <${message.email}>`,
      `Phone: ${message.phone || "(not provided)"}`,
      "",
      message.message,
    ].join("\n"),
    html: renderEmailHtml({
      heading: "New general inquiry",
      intro: "Someone submitted the site-wide contact form.",
      fields: [
        { label: "Name", value: message.name },
        { label: "Email", value: message.email, href: `mailto:${message.email}` },
        ...(message.phone ? [{ label: "Phone", value: message.phone, href: `tel:${message.phone}` }] : []),
      ],
      message: { label: "Message", body: message.message },
      cta: { label: "View in admin", url: `${SITE_URL}/admin/contact-submissions` },
    }),
    skippedContext: "SENDGRID_API_KEY not set — no email sent; submission saved to /admin.",
  });

  return NextResponse.json({ ok: true });
}
