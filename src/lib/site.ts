/**
 * Canonical site URL, used for the sitemap, robots.txt, and metadataBase.
 *
 * Set NEXT_PUBLIC_SITE_URL once a domain is chosen (see PLAN.md §8). Until
 * then this falls back to Vercel's own preview/production URL so links are
 * still correct on every deploy, and finally to localhost for local dev.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
