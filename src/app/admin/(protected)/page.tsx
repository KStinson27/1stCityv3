import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { properties } from "@/data/properties";
import { computePropertyStatus, getUnitAvailabilityForAllProperties } from "@/lib/unitAvailability";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [newVendorCount, newContactCount, overlayByProperty] = await Promise.all([
    prisma.vendorSubmission.count({ where: { status: "NEW" } }),
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    getUnitAvailabilityForAllProperties(),
  ]);

  const propertiesNeedingAvailability = properties.filter(
    (property) =>
      computePropertyStatus(property.units, overlayByProperty[property.slug] ?? {}) === "CONTACT",
  ).length;

  const cards = [
    {
      href: "/admin/vendor-submissions",
      label: "New vendor submissions",
      value: newVendorCount,
    },
    {
      href: "/admin/contact-submissions",
      label: "New contact submissions",
      value: newContactCount,
    },
    {
      href: "/admin/properties",
      label: "Properties missing availability",
      value: propertiesNeedingAvailability,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-16">
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col gap-2 rounded bg-surface p-6 shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="text-3xl font-bold text-primary-dark">{card.value}</span>
            <span className="text-sm text-text-secondary">{card.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
