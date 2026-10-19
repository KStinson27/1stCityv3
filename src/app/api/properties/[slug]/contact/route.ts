import { NextResponse } from "next/server";
import { propertyContactApiSchema } from "@/lib/validation";
import { getPropertyBySlug } from "@/data/properties";
import { prisma } from "@/lib/prisma";
import { getPropertyContent } from "@/lib/propertyContent";
import { checkRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/email";
import { renderEmailHtml } from "@/lib/emailTemplate";
import { SITE_URL } from "@/lib/site";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) {
    return NextResponse.json({ error: "Unknown property" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = propertyContactApiSchema.safeParse(body);
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
      preferredContact: message.preferredContact,
      propertySlug: property.slug,
      propertyName: property.name,
    },
  });

  const content = await getPropertyContent(property.slug);
  const notifyEmail =
    (content?.contactEmail ?? property.contactEmail) ?? "detroit1stcity@1stcityllc.com";

  await sendEmail({
    to: notifyEmail,
    subject: `Prospect inquiry: ${property.name}`,
    text: [
      `Property: ${property.name}`,
      `From: ${message.name} <${message.email}>`,
      `Phone: ${message.phone || "(not provided)"}`,
      `Preferred contact: ${message.preferredContact}`,
      "",
      message.message,
    ].join("\n"),
    html: renderEmailHtml({
      heading: `New inquiry — ${property.name}`,
      intro: "Someone asked about this property through the website.",
      fields: [
        { label: "Name", value: message.name },
        { label: "Email", value: message.email, href: `mailto:${message.email}` },
        ...(message.phone ? [{ label: "Phone", value: message.phone, href: `tel:${message.phone}` }] : []),
        { label: "Preferred contact", value: message.preferredContact },
      ],
      message: { label: "Message", body: message.message },
      cta: { label: "View in admin", url: `${SITE_URL}/admin/contact-submissions` },
    }),
    skippedContext: `SENDGRID_API_KEY not set — no email sent for ${property.name}; submission saved to /admin.`,
  });

  return NextResponse.json({ ok: true });
}
