import { NextResponse } from "next/server";
import { vendorSubmissionApiSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { checkRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/email";

/**
 * Phase 2 (see PLAN.md): submissions are now persisted so they show up
 * in /admin, in addition to the Phase 1 email notification.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = vendorSubmissionApiSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { recaptchaToken, website, ...submission } = parsed.data;

  // Honeypot: a real user never fills this in. Pretend success without
  // writing anything or sending an email, so bots get no useful signal.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!(await checkRecaptcha(recaptchaToken))) {
    return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
  }

  await prisma.vendorSubmission.create({
    data: {
      companyName: submission.companyName,
      contactName: submission.contactName,
      email: submission.email,
      phone: submission.phone || null,
      serviceType: submission.serviceType,
      message: submission.message,
      attachmentUrl: submission.attachmentUrl || null,
      attachmentName: submission.attachmentName || null,
    },
  });

  const notifyEmail = process.env.VENDOR_NOTIFICATION_EMAIL ?? "vendors@1stcityllc.example";

  await sendEmail({
    to: notifyEmail,
    subject: `New vendor proposal: ${submission.companyName}`,
    text: [
      `Company: ${submission.companyName}`,
      `Contact: ${submission.contactName}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "(not provided)"}`,
      `Service type: ${submission.serviceType}`,
      "",
      submission.message,
      "",
      "View and manage this submission in /admin.",
    ].join("\n"),
    skippedContext: "SENDGRID_API_KEY not set — no email sent; submission saved to /admin.",
  });

  return NextResponse.json({ ok: true });
}
