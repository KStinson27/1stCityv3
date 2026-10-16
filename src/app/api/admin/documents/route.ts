import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { properties } from "@/data/properties";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches the other upload routes

/**
 * Admin-only shared document upload (e.g. the rental application PDF used
 * across all affordable-housing properties). Keyed by a fixed `key`
 * rather than a property slug — see SiteDocument.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File storage isn't configured yet." },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const key = formData?.get("key");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof key !== "string" || !key) {
    return NextResponse.json({ error: "Missing document key" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is larger than 10MB" }, { status: 400 });
  }

  const blob = await put(`documents/${key}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const doc = await prisma.siteDocument.upsert({
    where: { key },
    create: { key, url: blob.url, fileName: file.name },
    update: { url: blob.url, fileName: file.name },
  });

  for (const property of properties.filter((p) => p.isSubsidized)) {
    revalidatePath(`/properties/${property.slug}`);
  }
  revalidatePath("/admin/documents");

  return NextResponse.json({ url: doc.url, fileName: doc.fileName });
}
