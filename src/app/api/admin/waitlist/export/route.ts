import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const dateFormatter = new Intl.DateTimeFormat("en-CA"); // YYYY-MM-DD

/** CSV of a single property's active waitlist signups, for the Waitlist admin page. */
export async function GET(request: Request) {
  try {
    await requirePermission("property_contact_submissions", "view");
  } catch {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const propertySlug = new URL(request.url).searchParams.get("property");
  if (!propertySlug) {
    return NextResponse.json({ error: "Missing property" }, { status: 400 });
  }

  const signups = await prisma.contactSubmission.findMany({
    where: { propertySlug, isWaitlistSignup: true, archivedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const header = ["Name", "Email", "Phone", "Unit type", "Signed up"];
  const rows = signups.map((s) => [
    s.name,
    s.email,
    s.phone ?? "",
    s.unitType ?? "",
    dateFormatter.format(s.createdAt),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${propertySlug}-waitlist.csv"`,
    },
  });
}
