# 1st City Rentals — Website Plan

Architecture and delivery plan for a property listing site (including subsidized/affordable housing units) with per-property pages and a vendor proposal intake form.

_Last updated: 2026-09-27_

## 1. Scope, from your answers

| Question | Answer | Implication |
|---|---|---|
| Portfolio size & churn | Small, stable (~1–15 properties) | No need for a heavyweight CMS or complex search/filtering. Content fits comfortably as structured files or a handful of database tables. |
| Who edits content | A developer/IT person | A Git-based content workflow (Markdown/MDX + a `content/` folder, or a lightweight admin form backed by the DB) is fine — no need to pay for a hosted headless CMS seat. |
| Vendor submissions | Form + internal tracking | Submissions must be stored (not just emailed) and viewable/updatable (status: new/reviewed/contacted) in a simple protected admin view. Requires a database and basic auth. |
| Hosting/budget | Some budget is fine (~$25–100/mo) | We can use paid tiers where they meaningfully reduce maintenance (e.g. Vercel Pro, a small managed Postgres), without needing to force everything onto free tiers. |

**Still open — please confirm before/while we build (see §7):** branding assets, domain name, and the subsidized-housing program details (income limits, waitlist process, required Fair Housing/Equal Housing Opportunity disclosures).

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

## 3. Site map

```
/                          Home — mission, featured properties, subsidized-housing callout, CTA
/properties                All properties, filterable by city/type/subsidized-or-not
/properties/[slug]         One property: photos, amenities, unit types, subsidized program details, contact
/vendors                   Vendor info + proposal/request submission form
/contact                   General company contact (optional, may fold into footer)
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
  subsidyNotes String?  // e.g. Section 8 accepted, income limits, waitlist status
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

## 6. Hosting cost estimate (monthly, USD)

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

## 7. Open questions before/while building

1. **Branding** — do you have an existing logo/color palette to use, or should the mockup use a neutral placeholder look for now?
2. **Domain name** — do you already own one, or does that need to be registered as part of this project?
3. **Subsidized housing compliance** — what needs to appear on each listing (income limits, waitlist status, required Equal Housing Opportunity logo/statement, Fair Housing Act disclosures)? This affects the property data model and page copy, and may have legal requirements beyond typical web content.
4. **Accessibility target** — should we explicitly target WCAG 2.2 AA (recommended for housing-related sites, and reduces legal risk under the Fair Housing Act/ADA)?
5. **Admin users** — roughly how many staff need `/admin` access to view vendor submissions, and do you want role differences (e.g. view-only vs. can-edit-status)?

## 8. Suggested phases

1. **Phase 1 — Scaffold**: Next.js + Tailwind project, static property pages from seed data, vendor form (email-only, no DB yet). Deployed to Vercel.
2. **Phase 2 — Persistence**: Add Neon + Prisma, move vendor submissions to the database, build `/admin` with Better Auth.
3. **Phase 3 — Polish**: Real property photos via Vercel Blob, accessibility pass, Fair Housing/EHO compliance copy, SEO basics (sitemap, meta tags).
4. **Phase 4 — Launch**: Custom domain, monitoring, Dependabot/Renovate turned on for ongoing dependency hygiene.

## 9. Mockup

A clickable HTML mockup (home, property listing, property detail, vendor proposal form) has been published separately — see the link shared alongside this plan.
