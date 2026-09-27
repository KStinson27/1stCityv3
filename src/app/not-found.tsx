import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <span className="text-[80px] font-bold leading-none text-primary-bg">404</span>
      <h1 className="text-[28px] font-bold">We can&apos;t find that page</h1>
      <p className="max-w-[440px] text-[15px] leading-relaxed text-text-secondary">
        The page you&apos;re looking for may have moved or no longer exists. Try one of
        the links below, or head back to the homepage.
      </p>

      <div className="flex gap-3.5 pt-2">
        <Link
          href="/"
          className="rounded bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-button"
        >
          Go to homepage
        </Link>
        <Link
          href="/properties"
          className="rounded border border-input-border px-6 py-3 text-sm font-medium uppercase tracking-wide text-[#424242]"
        >
          View properties
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-5 border-t border-border pt-6 text-[13px] font-medium">
        <Link href="/vendors" className="text-primary">
          Vendors
        </Link>
        <span className="text-border">·</span>
        <Link href="/about" className="text-primary">
          About
        </Link>
      </div>
    </section>
  );
}
