import { NextResponse } from "next/server";
import { waitlistSignupApiSchema } from "@/lib/validation";
import { getPropertyBySlug } from "@/data/properties";
import { prisma } from "@/lib/prisma";
import { getPropertyContent } from "@/lib/propertyContent";
import { checkRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/email";

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
  const parsed = waitlistSignupApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { recaptchaToken, website, ...signup } = parsed.data;

  // Honeypot: a real user never fills this in. Pretend success without
  // writing anything or sending an email, so bots get no useful signal.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!(await checkRecaptcha(recaptchaToken))) {
    return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
  }

  const content = await getPropertyContent(property.slug);

  // Independent of whatever the UI shows — affordable properties never
  // get a waitlist signup (see PLAN.md), and the admin may have turned
  // this off since the page was loaded.
  if (property.isSubsidized || !content?.waitlistSignupEnabled) {
    return NextResponse.json(
      { error: "Waitlist signup isn't available for this property" },
      { status: 400 }
    );
  }

  await prisma.contactSubmission.create({
    data: {
      name: signup.name,
      email: signup.email,
      phone: signup.phone || null,
      message: "Waitlist signup — notify when a unit becomes available.",
      propertySlug: property.slug,
      propertyName: property.name,
      isWaitlistSignup: true,
    },
  });

  const notifyEmail =
    (content?.contactEmail ?? property.contactEmail) ?? "detroit1stcity@1stcityllc.com";

  await sendEmail({
    to: notifyEmail,
    subject: `Waitlist signup: ${property.name}`,
    text: [
      `Property: ${property.name}`,
      `From: ${signup.name} <${signup.email}>`,
      `Phone: ${signup.phone || "(not provided)"}`,
      "",
      "They asked to be notified when a unit becomes available.",
    ].join("\n"),
    skippedContext: `SENDGRID_API_KEY not set — no email sent for ${property.name} waitlist signup; submission saved to /admin.`,
  });

  return NextResponse.json({ ok: true });
}
