import { NextResponse } from "next/server";
import { propertyContactSchema } from "@/lib/validation";
import { getPropertyBySlug } from "@/data/properties";

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
  const parsed = propertyContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const message = parsed.data;
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = property.contactEmail ?? "info@1stcityllc.example";

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
          subject: `Prospect inquiry: ${property.name}`,
          text: [
            `Property: ${property.name}`,
            `From: ${message.name} <${message.email}>`,
            `Phone: ${message.phone || "(not provided)"}`,
            `Preferred contact: ${message.preferredContact}`,
            "",
            message.message,
          ].join("\n"),
        }),
      });
    } catch (error) {
      console.error("Failed to send property contact email:", error);
    }
  } else {
    console.info(
      `RESEND_API_KEY not set — inquiry for ${property.name} logged instead of emailed:`,
      message
    );
  }

  return NextResponse.json({ ok: true });
}
