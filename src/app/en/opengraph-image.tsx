import { ImageResponse } from "next/og";
import { siteName } from "@/lib/seo";

export const runtime = "edge";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          backgroundColor: "#0b0b0c",
          backgroundImage:
            "radial-gradient(900px 450px at 30% 25%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(900px 450px at 70% 35%, rgba(166,124,82,0.18), transparent 60%), linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.55) 100%)",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.06) 100%)",
            opacity: 0.9,
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: "#A67C52",
                boxShadow: "0 0 0 6px rgba(166,124,82,0.14)",
              }}
            />
            <div
              style={{
                fontSize: 18,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              {siteName}
            </div>
          </div>

          <div
            style={{
              fontSize: 56,
              lineHeight: 1.05,
              fontWeight: 650,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Architectural design, permits, and turnkey delivery
          </div>

          <div
            style={{
              fontSize: 22,
              lineHeight: 1.45,
              opacity: 0.85,
              maxWidth: 900,
            }}
          >
            Residential • Commercial • Interior — Portfolio & contact
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

