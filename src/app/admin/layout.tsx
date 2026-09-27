import type { Metadata } from "next";

// Applies to every /admin route (login + the protected queue) — it's an
// internal staff tool, not part of the public site, and shouldn't show up
// in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
