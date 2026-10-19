"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon references image paths that don't survive
// bundling — point them at a CDN instead (a known workaround, not specific
// to this app).
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export type MapProperty = {
  slug: string;
  name: string;
  neighborhood: string | null;
  lat: number;
  lng: number;
};

export function PropertiesMap({ properties }: { properties: MapProperty[] }) {
  // react-leaflet reads window at import time — only safe post-mount.
  useEffect(() => {}, []);

  if (properties.length === 0) return null;

  const center: [number, number] = [
    properties.reduce((sum, p) => sum + p.lat, 0) / properties.length,
    properties.reduce((sum, p) => sum + p.lng, 0) / properties.length,
  ];

  return (
    // Leaflet's own panes/controls use z-index values up to 1000, which
    // otherwise escape above the site's sticky header (z-20) on scroll —
    // `isolate` gives this subtree its own stacking context so nothing
    // inside it can render above page chrome outside it.
    <div className="isolate">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "420px", width: "100%", borderRadius: "4px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((p) => (
          <Marker key={p.slug} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{p.name}</span>
                {p.neighborhood && <span className="text-xs text-text-secondary">{p.neighborhood}</span>}
                <Link href={`/properties/${p.slug}`} className="text-xs text-primary">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
