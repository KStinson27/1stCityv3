"use client";

import { useEffect, useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import type { Property } from "@/lib/types";
import type { UnitAvailabilityStatus } from "@/generated/prisma/enums";

type Filter = "all" | "subsidized" | "market-rate";
type SortOrder = "featured" | "price-asc" | "price-desc";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All properties" },
  { id: "subsidized", label: "Affordable housing" },
  { id: "market-rate", label: "Market rate" },
];

const BEDROOM_OPTIONS: { id: string; label: string; matches: (count: number) => boolean }[] = [
  { id: "studio", label: "Studio", matches: (c) => c === 0 },
  { id: "1", label: "1 Bed", matches: (c) => c === 1 },
  { id: "2", label: "2 Bed", matches: (c) => c === 2 },
  { id: "3+", label: "3+ Bed", matches: (c) => c >= 3 },
];

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: "featured", label: "Featured order" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

/** Bedroom count from a unit's type string — "Studio" / "2 Bedroom Townhome" / "3 Bedroom" / etc. */
function bedroomCount(unitType: string): number {
  if (/^studio/i.test(unitType)) return 0;
  const match = unitType.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

/** Parses the "$900"-style display string back to a number for sorting — null/unparsable sorts last. */
function parseRent(rent: string | null | undefined): number | null {
  if (!rent) return null;
  const amount = parseInt(rent.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(amount) ? null : amount;
}

export function PropertiesExplorer({
  properties,
  initialFilter = "all",
  statusBySlug = {},
  photosBySlug = {},
  rentBySlug = {},
  selectedSlug = null,
  onHoverCard,
}: {
  properties: Property[];
  initialFilter?: Filter;
  statusBySlug?: Record<string, UnitAvailabilityStatus>;
  photosBySlug?: Record<string, string[]>;
  rentBySlug?: Record<string, string | null>;
  /** Set when a map pin is clicked — the matching card scrolls into view and highlights. */
  selectedSlug?: string | null;
  /** Fired on card hover/unhover, so a parent can highlight the matching map pin. */
  onHoverCard?: (slug: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [bedrooms, setBedrooms] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortOrder>("featured");

  function toggleBedroom(id: string) {
    setBedrooms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setFilter("all");
    setOnlyAvailable(false);
    setBedrooms(new Set());
    setSort("featured");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    filter !== "all" ||
    onlyAvailable ||
    bedrooms.size > 0 ||
    sort !== "featured";

  const filtered = useMemo(() => {
    const activeBedroomFilters = BEDROOM_OPTIONS.filter((b) => bedrooms.has(b.id));

    const result = properties.filter((property) => {
      if (filter === "subsidized" && !property.isSubsidized) return false;
      if (filter === "market-rate" && property.isSubsidized) return false;
      if (onlyAvailable && statusBySlug[property.slug] !== "AVAILABLE") return false;

      if (activeBedroomFilters.length > 0) {
        const counts = property.units.map((u) => bedroomCount(u.type));
        const matchesAny = activeBedroomFilters.some((b) => counts.some(b.matches));
        if (!matchesAny) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${property.name} ${property.neighborhood ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sort === "featured") return result;

    const direction = sort === "price-asc" ? 1 : -1;
    return [...result].sort((a, b) => {
      const rentA = parseRent(rentBySlug[a.slug]);
      const rentB = parseRent(rentBySlug[b.slug]);
      if (rentA === null && rentB === null) return 0;
      if (rentA === null) return 1; // unknown price sorts last regardless of direction
      if (rentB === null) return -1;
      return (rentA - rentB) * direction;
    });
  }, [properties, filter, search, onlyAvailable, statusBySlug, bedrooms, sort, rentBySlug]);

  // A pin click selects a property that might be scrolled out of view below the map.
  useEffect(() => {
    if (!selectedSlug) return;
    document
      .getElementById(`property-card-${selectedSlug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedSlug]);

  return (
    <>
      <div className="mb-6 max-w-[480px]">
        <label className="sr-only" htmlFor="property-search">
          Search properties
        </label>
        <div className="flex items-center gap-2.5 rounded border border-input-border bg-surface px-4 py-3 focus-within:border-2 focus-within:border-primary focus-within:px-[15px] focus-within:py-[11px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="property-search"
            type="text"
            placeholder="Search by property name or neighborhood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-text outline-none"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5" role="group" aria-label="Filter properties">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={
                "rounded-full px-[18px] py-2 text-[13px] font-medium " +
                (active
                  ? "bg-primary text-white"
                  : "border border-input-border bg-surface text-[#424242]")
              }
            >
              {f.label}
            </button>
          );
        })}
        <span className="h-5 w-px bg-input-border" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={onlyAvailable}
          onClick={() => setOnlyAvailable((v) => !v)}
          className={
            "flex items-center gap-1.5 rounded-full px-[18px] py-2 text-[13px] font-medium " +
            (onlyAvailable
              ? "bg-primary-dark text-white"
              : "border border-input-border bg-surface text-[#424242]")
          }
        >
          {onlyAvailable && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          Has availability
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wide text-[#9e9e9e]">Bedrooms</span>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by bedroom count">
          {BEDROOM_OPTIONS.map((b) => {
            const active = bedrooms.has(b.id);
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleBedroom(b.id)}
                className={
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium " +
                  (active
                    ? "bg-primary text-white"
                    : "border border-input-border bg-surface text-[#424242]")
                }
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="property-sort" className="text-xs font-bold uppercase tracking-wide text-[#9e9e9e]">
            Sort
          </label>
          <select
            id="property-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="rounded border border-input-border bg-surface px-3 py-2 text-[13px] text-[#424242]"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-[13px] text-text-secondary">
          {hasActiveFilters
            ? `Showing ${filtered.length} of ${properties.length} properties`
            : `${properties.length} properties`}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[13px] font-medium text-primary hover:text-primary-dark"
          >
            Reset filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <div
              key={property.slug}
              id={`property-card-${property.slug}`}
              onMouseEnter={() => onHoverCard?.(property.slug)}
              onMouseLeave={() => onHoverCard?.(null)}
              className={
                "rounded transition-shadow " +
                (selectedSlug === property.slug ? "ring-2 ring-primary ring-offset-2" : "")
              }
            >
              <PropertyCard
                property={property}
                availabilityStatus={statusBySlug[property.slug]}
                photos={photosBySlug[property.slug]}
                startingRent={rentBySlug[property.slug]}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded border border-dashed border-input-border px-6 py-14 text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2 className="text-lg font-medium text-[#424242]">
            No properties match your search
          </h2>
          <p className="max-w-[380px] text-sm text-text-secondary">
            Try a different search term, or clear the filter to browse all properties.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 rounded border border-input-border px-5 py-2 text-sm font-medium text-[#424242]"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
