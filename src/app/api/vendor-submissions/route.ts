import { NextResponse } from "next/server";
import { vendorSubmissionApiSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

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

  const submission = parsed.data;

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

  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.VENDOR_NOTIFICATION_EMAIL ?? "vendors@1stcityllc.example";

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
        }),
      });
    } catch (error) {
      console.error("Failed to send vendor notification email:", error);
      // Don't fail the request over an email delivery issue — the
      // submission is already saved and visible in /admin.
    }
  } else {
    console.info("RESEND_API_KEY not set — no email sent; submission saved to /admin.");
  }

  return NextResponse.json({ ok: true });
}
