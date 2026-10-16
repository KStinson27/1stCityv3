"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vendor-submissions", label: "Vendor Submissions" },
  { href: "/admin/contact-submissions", label: "Contact Submissions" },
  { href: "/admin/properties", label: "Properties" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-border bg-surface px-4 md:px-16">
      {LINKS.map((link) => {
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
