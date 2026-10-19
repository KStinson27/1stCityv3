import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { properties } from "@/data/properties";
import { computePropertyStatus, getUnitAvailabilityForAllProperties } from "@/lib/unitAvailability";
import { hasPermission, requireSessionForPage } from "@/lib/permissions";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { permissions } = await requireSessionForPage();

  const canViewVendor = hasPermission(permissions, "vendor_submissions", "view");
  const canViewGeneral = hasPermission(permissions, "general_contact_submissions", "view");
  const canViewProperty = hasPermission(permissions, "property_contact_submissions", "view");
  const canViewProperties = hasPermission(permissions, "properties", "view");

  const [newVendorCount, newContactCount, activeWaitlistCount, overlayByProperty] = await Promise.all([
    canViewVendor ? prisma.vendorSubmission.count({ where: { status: "NEW" } }) : 0,
    canViewGeneral || canViewProperty
      ? prisma.contactSubmission.count({
          where: {
            status: "NEW",
            ...(canViewGeneral && canViewProperty
              ? {}
              : { propertySlug: canViewProperty ? { not: null } : null }),
          },
        })
      : 0,
    canViewProperty
      ? prisma.contactSubmission.count({
          where: { isWaitlistSignup: true, archivedAt: null },
        })
      : 0,
    canViewProperties
      ? getUnitAvailabilityForAllProperties()
      : Promise.resolve({} as Awaited<ReturnType<typeof getUnitAvailabilityForAllProperties>>),
  ]);

  const propertiesNeedingAvailability = properties.filter(
    (property) =>
      computePropertyStatus(property.units, overlayByProperty[property.slug] ?? {}) === "CONTACT",
  ).length;

  const cards = [
    canViewVendor && {
      href: "/admin/vendor-submissions",
      label: "New vendor submissions",
      value: newVendorCount,
      icon: <WrenchIcon />,
    },
    (canViewGeneral || canViewProperty) && {
      href: "/admin/contact-submissions",
      label: "New contact submissions",
      value: newContactCount,
      icon: <MailIcon />,
    },
    canViewProperties && {
      href: "/admin/properties",
      label: "Properties missing availability",
      value: propertiesNeedingAvailability,
      icon: <BuildingIcon />,
    },
    canViewProperty && {
      href: "/admin/waitlist",
      label: "Active waitlist signups",
      value: activeWaitlistCount,
      icon: <ClockIcon />,
    },
  ].filter(Boolean) as { href: string; label: string; value: number; icon: React.ReactNode }[];

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-24 text-center">
        <h1 className="text-xl font-medium">No access yet</h1>
        <p className="text-sm text-text-secondary">
          Your account isn&apos;t assigned any admin sections yet — contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-16">
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const urgent = card.value > 0;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={
                "flex flex-col gap-3 rounded border-l-4 bg-surface p-6 shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                (urgent ? "border-l-[#E65100] bg-[#FFFAF5]" : "border-l-transparent")
              }
            >
              <span
                className={
                  "flex h-10 w-10 items-center justify-center rounded-full " +
                  (urgent ? "bg-[#FFF3E0] text-[#E65100]" : "bg-background text-[#9e9e9e]")
                }
              >
                {card.icon}
              </span>
              <span
                className={
                  "text-3xl font-bold " + (urgent ? "text-[#E65100]" : "text-primary-dark")
                }
              >
                {card.value}
              </span>
              <span className="text-sm text-text-secondary">{card.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2 6 12 13 22 6" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="9" y1="7" x2="9" y2="7" />
      <line x1="15" y1="7" x2="15" y2="7" />
      <line x1="9" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="15" y2="12" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
