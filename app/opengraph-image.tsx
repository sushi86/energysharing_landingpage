import { ImageResponse } from "next/og";

export const alt = "Energy Sharing Chattengau — Sonnenstrom für die Nachbarschaft";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 55%, #52b788 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: 1,
            color: "#d8f3dc",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#52b788",
            }}
          />
          Pilotprojekt Chattengau · 2026
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            Sonnenstrom aus der Nachbarschaft.
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              color: "#d8f3dc",
              maxWidth: 900,
            }}
          >
            Energy Sharing für Niedenstein, Edermünde und Gudensberg — solarstrom lokal teilen
            statt anonym einspeisen.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#d8f3dc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>☀️</span>
            Nordhessen · EAM-Netzgebiet
          </div>
          <div>energy-sharing-chattengau</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
