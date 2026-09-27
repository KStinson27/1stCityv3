"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/vendors", label: "Vendors" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-primary shadow-appbar">
      <div className="flex h-[72px] items-center justify-between px-4 md:px-16">
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-4 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+15551234567"
            className="ml-3 flex items-center gap-2 rounded bg-white px-[18px] py-2 text-[13px] font-medium tracking-wide text-primary-dark shadow-button"
          >
            (555) 123-4567
          </a>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center justify-center rounded p-1 text-white md:hidden"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+15551234567"
            className="mt-1 rounded bg-white px-3 py-2 text-center text-sm font-medium text-primary-dark"
          >
            (555) 123-4567
          </a>
        </nav>
      )}
    </header>
  );
}
