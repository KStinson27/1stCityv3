import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "1st City LLC",
    template: "%s — 1st City LLC",
  },
  description:
    "1st City LLC manages quality market-rate and subsidized housing throughout the city.",
};

// Public pages get the marketing Header/Footer via (site)/layout.tsx;
// /admin has its own chrome (see admin/(protected)/layout.tsx) since it's
// an internal tool, not part of the public site.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
