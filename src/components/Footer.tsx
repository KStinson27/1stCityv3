import Link from "next/link";
import { WordmarkPlate } from "./Logo";
import { EqualHousingLogo } from "./EqualHousingLogo";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#212121] px-4 pb-8 pt-14 text-[#f5f5f5] md:px-16">
      <div className="flex flex-col justify-between gap-12 md:flex-row">
        <div className="flex max-w-[300px] flex-col gap-3">
          <WordmarkPlate />
          <p className="text-sm leading-relaxed text-[#9e9e9e]">
            1st City LLC manages quality market-rate and affordable housing throughout
            Michigan.
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
            <Link href="/contact" className="text-sm text-[#e0e0e0] hover:text-white">
              Contact
            </Link>
            <Link href="/#subsidized" className="text-sm text-[#e0e0e0] hover:text-white">
              Affordable housing
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Contact
            </span>
            <span className="text-sm text-[#e0e0e0]">28 W Adams, Ste 900, Detroit, MI 48226</span>
            <span className="text-sm text-[#e0e0e0]">(313) 965-4547</span>
            <span className="text-sm text-[#e0e0e0]">detroit1stcity@1stcityllc.com</span>
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
        <span className="flex items-center gap-5">
          <Link href="/admin" className="text-[#757575] hover:text-white">
            Staff Login
          </Link>
          <EqualHousingLogo size={32} />
        </span>
      </div>
    </footer>
  );
}
