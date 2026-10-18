import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches the vendor-upload limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Admin-only property photo upload. Unlike /api/uploads (public, PDF-only,
 * vendor attachments), this requires a staff session — property photos
 * are an authenticated admin action, not a public form submission.
 */
export async function POST(request: Request) {
  try {
    await requirePermission("properties", "edit");
  } catch {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File storage isn't configured yet." },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const propertySlug = formData?.get("propertySlug");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof propertySlug !== "string" || !propertySlug) {
    return NextResponse.json({ error: "Missing propertySlug" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WEBP images are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is larger than 10MB" }, { status: 400 });
  }

  const blob = await put(`property-photos/${propertySlug}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const last = await prisma.propertyPhoto.findFirst({
    where: { propertySlug },
    orderBy: { sortOrder: "desc" },
  });
  const photo = await prisma.propertyPhoto.create({
    data: { propertySlug, url: blob.url, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });

  revalidatePath(`/properties/${propertySlug}`);
  revalidatePath("/properties");
  revalidatePath("/");
  revalidatePath("/admin/properties");

  return NextResponse.json({ id: photo.id, url: photo.url, sortOrder: photo.sortOrder });
}
