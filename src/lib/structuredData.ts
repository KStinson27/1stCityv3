import { SITE_URL } from "@/lib/site";
import type { Property, Unit } from "@/lib/types";

/** "5285 E H Ave, Kalamazoo, MI 49048" -> { streetAddress, addressLocality, addressRegion, postalCode } */
function parseAddress(address: string | null) {
  if (!address) return {};
  const [streetAddress, addressLocality, stateZip] = address.split(",").map((s) => s.trim());
  const match = stateZip?.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
  return {
    streetAddress,
    addressLocality,
    addressRegion: match?.[1],
    postalCode: match?.[2],
  };
}

/**
 * schema.org ApartmentComplex structured data for a property detail page —
 * lets search engines show richer results (address, photos, amenities)
 * instead of just a plain link. Deliberately leaves out price: free-text
 * rent per unit type doesn't map cleanly to schema.org's Offer shape, and
 * incorrect structured pricing is worse than none.
 */
export function buildApartmentComplexJsonLd({
  property,
  description,
  amenities,
  photos,
  units,
}: {
  property: Property;
  description: string | null;
  amenities: string[];
  photos: string[];
  units: Unit[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: property.name,
    description: description ?? undefined,
    url: `${SITE_URL}/properties/${property.slug}`,
    image: photos.map((p) => (p.startsWith("http") ? p : `${SITE_URL}${p}`)),
    address: { "@type": "PostalAddress", ...parseAddress(property.address) },
    amenityFeature: amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
    })),
    numberOfAccommodationUnits: units.length > 0 ? units.length : undefined,
  };
}

/** Safe to embed in a <script type="application/ld+json"> — escapes "<" so "</script>" in any field can't break out early. */
export function toJsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
