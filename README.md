# 1st City LLC — Website

Property listing and vendor-intake site for 1st City LLC. See [`PLAN.md`](./PLAN.md)
for the full architecture plan, phased rollout, and open questions.

**Status: Phase 1 (scaffold).** Static pages seeded from placeholder/mockup content,
vendor and property-contact forms working end-to-end (validated, emailed via Resend
when configured, otherwise logged to the server console). No database yet — see
PLAN.md §9 for Phase 2 (Neon/Prisma + the admin queue) and beyond.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Hook Form +
Zod for form validation.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — forms work without this, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` to enable real email delivery for the vendor and
property-contact forms (via [Resend](https://resend.com)). Without it, submissions are
validated and logged to the server console instead of emailed — useful for local
development without setting up an email provider.

## Project structure

```
src/
  app/                        Routes (App Router)
    page.tsx                  Home
    properties/                /properties — listing (search + filter)
      [slug]/                  /properties/:slug — detail
        contact/               /properties/:slug/contact — inquiry form
    vendors/                   /vendors — vendor proposal form
    about/                     /about — leadership, fair housing commitment
    privacy/, terms/           Placeholder legal pages (see PLAN.md §8)
    not-found.tsx              Custom 404
    api/                       Form-submission API routes
  components/                  Shared UI (Header, Footer, forms, property card)
  data/properties.ts           Seed data for the 9 properties (Phase 1; becomes
                                database-backed in Phase 2)
  lib/                         Shared types and Zod validation schemas
```

## Known gaps (tracked in PLAN.md)

- No database — property and vendor-submission data isn't persisted yet.
- No `/admin` vendor-submission queue or staff auth yet (Phase 2).
- Most property fields (address, income limits, required documents, RealPage
  application links) are placeholders pending real data — see `src/data/properties.ts`
  and PLAN.md §8.
- `/privacy` and `/terms` are stubs pending attorney-drafted text.
