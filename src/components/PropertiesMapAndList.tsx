"use client";

import { useState } from "react";
import { PropertiesMap, type MapProperty } from "./PropertiesMap";
import { PropertiesExplorer } from "./PropertiesExplorer";
import type { Property } from "@/lib/types";
import type { UnitAvailabilityStatus } from "@/generated/prisma/enums";

/**
 * Owns the one piece of state the map and list share — a Server Component
 * can't hold this itself, and the two were previously separate client
 * islands with no way to talk to each other. Clicking a pin scrolls/
 * highlights its card; hovering a card opens its pin's popup.
 */
export function PropertiesMapAndList({
  mapProperties,
  initialMapCenter,
  initialMapZoom,
  ...explorerProps
}: {
  mapProperties: MapProperty[];
  initialMapCenter?: [number, number];
  initialMapZoom?: number;
  properties: Property[];
  initialFilter?: "all" | "subsidized" | "market-rate";
  statusBySlug?: Record<string, UnitAvailabilityStatus>;
  photosBySlug?: Record<string, string[]>;
  rentBySlug?: Record<string, string | null>;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  return (
    <>
      <div className="mb-8">
        <PropertiesMap
          properties={mapProperties}
          initialCenter={initialMapCenter}
          initialZoom={initialMapZoom}
          selectedSlug={selectedSlug}
          onSelectPin={setSelectedSlug}
        />
      </div>

      <PropertiesExplorer
        {...explorerProps}
        selectedSlug={selectedSlug}
        onHoverCard={setSelectedSlug}
      />
    </>
  );
}
