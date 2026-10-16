import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const message = parsed.data;
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
