import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches the form copy

/**
 * Handles vendor-form attachments (proposals, W-9s, insurance certs).
 *
 * Stored with `access: "public"` and a random suffix — the URL is
 * unguessable but not access-controlled the way a signed/private URL
 * would be. Fine for Phase 2; revisit if these documents need real
 * access control (a W-9 carries a tax ID) before this is used for
 * anything more sensitive.
 *
 * Without BLOB_READ_WRITE_TOKEN configured, uploads are skipped and the
 * vendor form falls back to filename-only capture (same as Phase 1) —
 * same graceful-degradation pattern as the Resend integration.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { skipped: true, reason: "File storage isn't configured yet." },
      { status: 200 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is larger than 10MB" }, { status: 400 });
  }

  const blob = await put(`vendor-attachments/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url, name: file.name });
}
