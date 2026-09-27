import { NextResponse } from "next/server";
import { vendorSubmissionSchema } from "@/lib/validation";

/**
 * Phase 1 (see PLAN.md): no database yet, so a submission is validated
 * and emailed to staff rather than persisted. Phase 2 adds Prisma/Neon
 * and writes a VendorSubmission row here instead (or in addition).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = vendorSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const submission = parsed.data;
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
          ].join("\n"),
        }),
      });
    } catch (error) {
      console.error("Failed to send vendor notification email:", error);
      // Don't fail the request over an email delivery issue — the
      // submission itself is still valid and acknowledged below.
    }
  } else {
    console.info(
      "RESEND_API_KEY not set — vendor submission logged instead of emailed:",
      submission
    );
  }

  return NextResponse.json({ ok: true });
}
