import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-dark focus:shadow-card"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
