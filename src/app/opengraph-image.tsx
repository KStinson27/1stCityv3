import { ImageResponse } from "next/og";

export const alt = "1st City LLC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#2e7d32",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 20,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 700,
            color: "#2e7d32",
          }}
        >
          1C
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#ffffff" }}>
          1st City LLC
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#c8e6c9" }}>
          Quality market-rate &amp; subsidized housing
        </div>
      </div>
    ),
    { ...size }
  );
}
