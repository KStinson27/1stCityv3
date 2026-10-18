"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; visible: (perms: Set<string>) => boolean }[] = [
  { href: "/admin", label: "Dashboard", visible: () => true },
  {
    href: "/admin/vendor-submissions",
    label: "Vendor Submissions",
    visible: (perms) => perms.has("vendor_submissions:view"),
  },
  {
    href: "/admin/contact-submissions",
    label: "Contact Submissions",
    visible: (perms) =>
      perms.has("general_contact_submissions:view") ||
      perms.has("property_contact_submissions:view"),
  },
  {
    href: "/admin/properties",
    label: "Properties",
    visible: (perms) => perms.has("properties:view"),
  },
  {
    href: "/admin/documents",
    label: "Documents",
    visible: (perms) => perms.has("documents:view"),
  },
  { href: "/admin/staff", label: "Staff & Roles", visible: (perms) => perms.has("staff:view") },
  { href: "/admin/security", label: "Security", visible: () => true },
];

export function AdminNav({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const perms = new Set(permissions);
  const links = LINKS.filter((link) => link.visible(perms));

  return (
    <nav className="flex items-center gap-1 border-b border-border bg-surface px-4 md:px-16">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              "border-b-2 px-3 py-3.5 text-sm font-medium " +
              (active
                ? "border-primary text-primary-dark"
                : "border-transparent text-text-secondary hover:text-text")
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
