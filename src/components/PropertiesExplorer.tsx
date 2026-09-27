"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import type { Property } from "@/lib/types";

type Filter = "all" | "subsidized" | "market-rate";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All properties" },
  { id: "subsidized", label: "Subsidized housing" },
  { id: "market-rate", label: "Market rate" },
];

export function PropertiesExplorer({
  properties,
  initialFilter = "all",
}: {
  properties: Property[];
  initialFilter?: Filter;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      if (filter === "subsidized" && !property.isSubsidized) return false;
      if (filter === "market-rate" && property.isSubsidized) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${property.name} ${property.neighborhood ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [properties, filter, search]);

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

      <div className="mb-6 flex flex-wrap items-center gap-2.5" role="group" aria-label="Filter properties">
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
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard key={property.slug} property={property} />
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
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-1 rounded border border-input-border px-5 py-2 text-sm font-medium text-[#424242]"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
