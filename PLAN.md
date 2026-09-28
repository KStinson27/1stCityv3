# 1st City LLC — Website Plan

Architecture and delivery plan for a property listing site (including subsidized/affordable housing units) with per-property pages and a vendor proposal intake form.

_Last updated: 2026-09-27_

## 1. Scope, from your answers

| Question | Answer | Implication |
|---|---|---|
| Portfolio size & churn | Small, stable (~1–15 properties) | No need for a heavyweight CMS or complex search/filtering. Content fits comfortably as structured files or a handful of database tables. |
| Who edits content | A developer/IT person | A Git-based content workflow (Markdown/MDX + a `content/` folder, or a lightweight admin form backed by the DB) is fine — no need to pay for a hosted headless CMS seat. |
| Vendor submissions | Form + internal tracking | Submissions must be stored (not just emailed) and viewable/updatable (status: new/reviewed/contacted) in a simple protected admin view. Requires a database and basic auth. |
| Hosting/budget | Some budget is fine (~$25–100/mo) | We can use paid tiers where they meaningfully reduce maintenance (e.g. Vercel Pro, a small managed Postgres), without needing to force everything onto free tiers. |

**Still open — please confirm before/while we build (see §7):** domain name, the real income-limit figures and required-document checklist per subsidized property, who receives reasonable-accommodation requests, and which RealPage/OneSite module handles online applications (see §5a).

**Resolved via the mockup:** branding — green (`#2E7D32` family) + a simple "1C" monogram logo, MUI-style component look built with hand-rolled Tailwind-equivalent markup (see §2 note).

## 2. Recommended tech stack

Chosen for: small team maintaining it, developer-managed content, a real (if small) database need for vendor tracking, and "some budget is fine." Versions below were checked against each project's release notes as of **September 27, 2026** — re-check before you actually run `npm install`, since patch releases ship continuously.

| Layer | Choice | Latest stable (Sept 2026) | Notes |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.3.6 (Active LTS); 15.5.26 (Maintenance LTS) | Next 16 is the current Active LTS line. A security release (16.3.7) is expected Sept 30, 2026 — build with `next@latest` and let it pick that up. |
| UI library | **React** | 19.3.0 | Ships with Next 16 by default. |
| Language | **TypeScript** | 5.x (latest) | Catches data-shape bugs across property/vendor forms at compile time. |
| Styling | **Tailwind CSS** | 4.3.2 | v4's CSS-first config (no `tailwind.config.js` needed) is simpler for a small site; use `@tailwindcss/postcss` or the new webpack plugin per your build. |
| Database | **PostgreSQL** via **Neon** (serverless) | — | Usage-based pricing, scales to zero when idle (cheap for a low-traffic site), no server to patch. Alternative: Supabase if you also want a built-in admin table UI for free. |
| ORM | **Prisma ORM** | 7.10.0 (recommended for production) | Prisma 8 is in release-candidate as of Sept 2026 (GA expected Oct 2026) — stay on 7.x until 8 is GA and you've reviewed the migration guide. |
| Auth (admin only) | **Better Auth** | 1.x (latest) | Auth.js/NextAuth v5 maintainers now point new projects to Better Auth; v5 only makes sense when migrating an existing app. We only need auth for the internal vendor-submissions view (1–3 staff accounts), so keep it to email/password or a magic link — no public user accounts needed. |
| Image handling | **next/image** + **Vercel Blob** (or Cloudinary free tier) | — | Property photos stored as blobs, served resized/optimized automatically. |
| Transactional email | **Resend** + **React Email** | — | Sends the "new vendor submission" notification to staff. Free tier (3,000 emails/mo) is plenty at this scale. |
| Forms/validation | **React Hook Form** + **Zod** | latest | Shared schema validates the vendor form on client and server. |
| Hosting | **Vercel** (Pro plan) | — | Built by the Next.js team; zero-config deploys, previews per PR, image optimization included. |
| Testing | **Vitest** + **Playwright** | latest | Unit tests for form/validation logic, one Playwright smoke test per key page (home, property detail, vendor form submit). |
| Dependency hygiene | **`npm outdated`** / **Renovate** or **Dependabot** | — | Automated PRs when a dependency goes stale or gets a security advisory — this is the actual mechanism for "always latest," not a one-time choice. |

**Why not a headless CMS (Sanity/Payload/Contentful)?** With ≤15 properties edited by a developer, a CMS subscription and its extra moving part isn't buying you much. Property data lives as typed content (Markdown+frontmatter or straight DB rows managed via Prisma Studio) in the same repo, versioned in Git. If content ownership later shifts to non-technical staff, this is the piece to swap — everything else (routing, styling, vendor DB) stays the same.

**On the "MUI + Tailwind, green" look from the mockup:** the mockup recreates Material Design's visual language (AppBar, elevated cards, filled buttons, Chips) by hand in Tailwind-equivalent markup — it does **not** require adding `@mui/material` as a real dependency. Tailwind alone can reproduce this look (shadows, radii, and the green palette are just utility classes/tokens). Only add the actual MUI library if you specifically want its React components (form validation states, date pickers, etc.) rather than just the look — that's a bigger dependency and a different theming system than Tailwind, so it's worth deciding deliberately rather than defaulting into it.

## 3. Site map

```
/                          Home — mission, featured properties, subsidized-housing callout, CTA
/properties                All properties, filterable by city/type/subsidized-or-not
/properties/[slug]         One property: photos, amenities, unit types, eligibility/income limits,
                            required documents, "Apply Online" (→ RealPage/OneSite), subsidized
                            program details, contact
/vendors                   Vendor info + proposal/request submission form
/about                     Company bio (owner, director), fair housing & reasonable accommodation
                            statement, portfolio summary
/contact                   General company contact (optional, may fold into footer)
/privacy                   Privacy Policy (content pending attorney review — see §7)
/terms                     Terms of Use (content pending attorney review — see §7)
/admin                     (auth-gated) Vendor submission queue: list, status, notes
/admin/login               Staff sign-in
```

## 4. Data model (Prisma schema, sketch)

```prisma
model Property {
  id           String   @id @default(cuid())
  slug         String   @unique
  name         String
  address      String
  city         String
  state        String
  zip          String
  description  String
  isSubsidized Boolean  @default(false)
  subsidyNotes String?  // e.g. Section 8 accepted, waitlist status
  incomeLimits Json?    // household size -> max annual income, from HUD's annual AMI chart
  requiredDocs String[] // document checklist for a subsidized application at this property
  applyUrl     String?  // deep link to this property's RealPage/OneSite applicant portal
  contactName  String
  contactEmail String
  contactPhone String
  photos       Photo[]
  amenities    Amenity[]
  units        Unit[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Photo {
  id         String   @id @default(cuid())
  url        String
  altText    String
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
}

model Amenity {
  id         String   @id @default(cuid())
  label      String   // "In-unit laundry", "Off-street parking", "Wheelchair accessible"
  properties Property[]
}

model Unit {
  id           String   @id @default(cuid())
  bedrooms     Int
  bathrooms    Float
  rentAmount   Int?     // nullable — subsidized units may show "income-based" instead
  isAvailable  Boolean  @default(true)
  propertyId   String
  property     Property @relation(fields: [propertyId], references: [id])
}

model VendorSubmission {
  id           String   @id @default(cuid())
  companyName  String
  contactName  String
  email        String
  phone        String?
  serviceType  String   // e.g. "Landscaping", "HVAC", "General contracting"
  message       String
  attachmentUrl String?  // optional proposal/W9/insurance doc
  status       Status   @default(NEW)
  internalNote String?
  createdAt    DateTime @default(now())
}

enum Status {
  NEW
  REVIEWED
  CONTACTED
  DECLINED
}
```

## 5. Vendor intake flow

1. Vendor visits `/vendors`, fills out the form (company, contact, service type, message, optional file upload).
2. Zod validates client- and server-side; server action writes a `VendorSubmission` row and uploads any attachment to Vercel Blob.
3. Resend sends a notification email to a staff distribution address.
4. Staff log into `/admin`, see submissions newest-first, filter by status, and update status/notes as they follow up.
5. No public-facing status tracking for vendors in this phase (that's the "full portal" option you didn't pick) — if that changes later, it's an additive feature, not a rearchitecture.

## 6. Digital application strategy (RealPage/OneSite)

Applications for subsidized units currently go through paper forms submitted to the office; waitlist and leasing already run on RealPage/OneSite. Recommendation: **don't build a custom application/eligibility engine on the new site.** Subsidized-housing applications carry HUD/LIHTC-specific logic — income limits by household size and program, per-property document checklists, audit trails for compliance reporting — that RealPage's affordable-housing modules already handle. Reimplementing that logic in the new Next.js app would mean owning compliance risk (audit findings, LIHTC recapture) that RealPage is already built and certified for.

In order of preference:

1. **Deep-link to RealPage's own applicant portal (recommended)** — each `Property.applyUrl` points straight to that property's RealPage-hosted application. Confirm with your RealPage rep which current product covers this (an online leasing/applicant-portal add-on — the exact name shifts, so verify rather than assume) and whether it's already licensed. Lowest engineering cost, lowest compliance risk, and this is reflected in the mockup as the "Apply Online" button on each property page.
2. **Embed the RealPage portal in an iframe** on the property page instead of linking out, if RealPage allows iframe embedding for your account — same ownership of compliance logic, just keeps the visitor on-domain.
3. **Custom application built on the new site, pushed into RealPage via API** — only worth it for a fully custom-branded flow. Requires RealPage Exchange/API access (may need a paid integration entitlement) and you'd still need to mirror their eligibility rules. Not the starting point.

Keep paper applications available during the transition — some applicants won't have reliable internet access — and phase the digital option in property by property.

## 7. Hosting cost estimate (monthly, USD)

Given "some budget is fine," this targets reliability over squeezing to $0 — but nothing here is aggressively overbought for a ~1–15 property site.

| Item | Plan | Est. cost/mo |
|---|---|---|
| Vercel (hosting, previews, image optimization) | Pro, 1 seat | $20 |
| Neon Postgres | Launch tier, light usage (small DB, low query volume) | $5–15 |
| Vercel Blob storage (property photos) | Pay-as-you-go, a few hundred MB–low GB of images | $0–5 |
| Resend (email notifications) | Free tier (3,000 emails/mo) | $0 |
| Domain registration | e.g. `.com` via any registrar | ~$1–2/mo (amortized $12–15/yr) |
| Error/uptime monitoring (optional) | e.g. Sentry free tier | $0 |
| **Total** | | **~$26–42/mo**, call it **$30–50/mo** with headroom |

This comfortably fits inside "some budget is fine." If traffic or the portfolio grows a lot, the main line items that scale are Vercel bandwidth/function usage and Neon compute — both usage-based, so cost grows with actual load rather than a step-function upgrade.

## 8. Open questions before/while building

1. **Domain name** — do you already own one, or does that need to be registered as part of this project?
2. **Real eligibility data per subsidized property** — actual income limits by household size (Devin Apartments, Lanier Court Apartments, West Chicago Apartments, Orchestra Tower) and the exact required-document checklist for each. The mockup shows the layout with bracketed placeholders.
3. **RealPage/OneSite application module** — which current RealPage product provides the applicant-facing online portal, whether it's already licensed, and whether it supports per-property deep links or iframe embedding (see §6).
4. **Reasonable accommodation contact** — who receives accommodation/modification requests (property office, a central compliance contact, or both)?
5. **Legal page content** — Privacy Policy and Terms of Use need to be drafted or reviewed by your attorney before launch; the mockup only shows placeholder links for these, not drafted text, since that's not something to generate without legal review (state law — e.g. CCPA-style requirements — and your actual data practices need to be reflected accurately).
6. **Accessibility target** — should we explicitly target WCAG 2.2 AA (recommended for housing-related sites, and reduces legal risk under the Fair Housing Act/ADA)?
7. **Admin users** — roughly how many staff need `/admin` access to view vendor submissions, and do you want role differences (e.g. view-only vs. can-edit-status)?

## 9. Suggested phases

1. **Phase 1 — Scaffold ✅ done** (`c49fa55`): Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 app, styled to match the approved mockup. Home, Properties (search + filter), Property Detail (eligibility section, Apply Online, contact form), Vendors, About, and a custom 404 all live. Vendor and property-contact forms validate with Zod and email via Resend when configured, otherwise log to the console — no database yet. Property data is seed data in `src/data/properties.ts` with real names/subsidized flags but placeholder facts pending §8. Not yet deployed to Vercel (needs your Vercel account — see README).
2. **Phase 2 — Persistence ✅ done**: Prisma 7 (driver-adapter setup, `prisma.config.ts`) + Postgres, with Better Auth (email+password, single staff role) protecting `/admin`. Vendor submissions now persist to the database and show up in a staff queue (`/admin`) with status (New/Reviewed/Contacted/Declined), an internal note per submission, and tab counts. Vendor-form attachments upload to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured, and skip gracefully (filename-only) when it isn't. First staff login is created via `npm run db:seed` (`prisma/seed.ts`), not self-service sign-up. Verified end-to-end locally (login → queue → status/note update persists across reload → sign out → `/admin` redirects to login again) against a local Postgres instance; production still needs a real Neon connection string (`DATABASE_URL`) and a real `BETTER_AUTH_SECRET` set in Vercel before deploying.
3. **Phase 3 — Polish ✅ done**: Accessibility pass (skip links, form label/error associations, focus states, tab/filter semantics). SEO basics: `sitemap.xml`, `robots.txt` (with `/admin` disallowed and noindexed), `metadataBase` + Open Graph/Twitter defaults, a generated share image. Fair Housing/EHO compliance copy in place (About page + every property/footer callout); leadership bios and the mission blurb stay intentionally brief until real copy is provided. Standard Privacy Policy/Terms of Use content added to `/privacy` and `/terms` — boilerplate, flagged in-code as not yet attorney-reviewed. Real logo live everywhere (navbar, footer, admin header, login) — see `src/components/Logo.tsx`; navbar/admin header recolored to white since the logo's black text needs a light background. Property photos live for all 8 properties (`Property.photos[]` in `src/data/properties.ts`, served from `public/properties/<slug>/` via `next/image`) — 6 have just a main exterior shot, 2 (Comstock Tower, Marketplace Court) have galleries. (Comstock Village was removed from the site — no longer managed by 1st City LLC.) Still open, not blocking launch: per-property "Apply Online" links into RealPage (§6) once that integration is set up; more photos for the 6 single-photo properties whenever available.
4. **Phase 4 — Launch (in progress)**: Site is deployed to Vercel. `npm run build` now runs `prisma migrate deploy` automatically before `next build`, so pushing `DATABASE_URL` to a fresh database (e.g. Neon) and redeploying is enough to set up its schema — no manual migration step needed. Still needed: a real Neon `DATABASE_URL` and a production `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` set in Vercel's environment variables (see README/chat for the generated secret and exact steps), then running `npm run db:seed` once against that database to create the first staff login. Custom domain, monitoring, and Dependabot/Renovate still open.

## 10. Mockup

A clickable HTML mockup has been published separately — see the link shared alongside this plan. It now covers: Home, Properties (all 9, correctly badged subsidized/market-rate), Property Detail (with an eligibility/income-limits/required-documents section and an "Apply Online" flow into RealPage), Vendors, and About (leadership bios, fair housing & reasonable-accommodation statement), each with both a desktop and a mobile layout.
