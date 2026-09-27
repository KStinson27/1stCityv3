import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#212121] px-4 pb-8 pt-14 text-[#f5f5f5] md:px-16">
      <div className="flex flex-col justify-between gap-12 md:flex-row">
        <div className="flex max-w-[300px] flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="text-base font-medium">1st City LLC</span>
          </div>
          <p className="text-sm leading-relaxed text-[#9e9e9e]">
            1st City LLC manages quality market-rate and subsidized housing throughout the
            city.
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Company
            </span>
            <Link href="/properties" className="text-sm text-[#e0e0e0] hover:text-white">
              Properties
            </Link>
            <Link href="/vendors" className="text-sm text-[#e0e0e0] hover:text-white">
              Vendors
            </Link>
            <Link href="/about" className="text-sm text-[#e0e0e0] hover:text-white">
              About
            </Link>
            <Link href="/#subsidized" className="text-sm text-[#e0e0e0] hover:text-white">
              Subsidized housing
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Contact
            </span>
            <span className="text-sm text-[#e0e0e0]">220 Main Street, Suite 300</span>
            <span className="text-sm text-[#e0e0e0]">(555) 123-4567</span>
            <span className="text-sm text-[#e0e0e0]">info@1stcityllc.example</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Legal
            </span>
            <Link href="/privacy" className="text-sm text-[#e0e0e0] hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[#e0e0e0] hover:text-white">
              Terms of Use
            </Link>
            <Link href="/about#commitment" className="text-sm text-[#e0e0e0] hover:text-white">
              Accessibility &amp; Reasonable Accommodations
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-[#757575] md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} 1st City LLC. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7" />
            <path d="M9 22V12h6v10" />
          </svg>
          Equal Housing Opportunity
        </span>
      </div>
    </footer>
  );
}
