import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// The picture LinkedIn, WhatsApp and others show when the portal link is shared.
// It's generated once at build time.
export const alt = `Send your CV to ${SITE.owner.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type FontWeight = 500 | 800;

// The site's headline typeface. If a font file is missing the image still
// renders, just in the default font.
async function loadFont(file: string, weight: FontWeight) {
  try {
    const data = await readFile(join(process.cwd(), "src/app/fonts", file));
    return [{ name: "Bricolage", data, weight, style: "normal" as const }];
  } catch {
    return [];
  }
}

export default async function OpengraphImage() {
  const fonts = [
    ...(await loadFont("BricolageGrotesque-ExtraBold.ttf", 800)),
    ...(await loadFont("BricolageGrotesque-Medium.ttf", 500)),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          background: "#0B362D",
          color: "#FFFFFF",
          padding: 64,
          fontFamily: fonts.length ? "Bricolage" : "sans-serif",
          fontWeight: 500,
        }}
      >
        {/* Left: brand, headline, who */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 650,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: 15,
                background: "#FFB526",
                color: "#07261F",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {SITE.shortName}
            </div>
            <div style={{ fontSize: 28, color: "#B5D2C4" }}>Talent Registry</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -1.5,
            }}
          >
            <div>Send your CV once.</div>
            <div>Be considered every time a role fits.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{SITE.owner.name}</div>
            <div style={{ marginTop: 4, fontSize: 24, color: "#B5D2C4" }}>
              {SITE.owner.headline}
            </div>
          </div>
        </div>

        {/* Right: the registry card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 148,
              width: 360,
              height: 250,
              borderRadius: 22,
              background: "#22705A",
              transform: "rotate(6deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 14,
              top: 142,
              width: 360,
              height: 250,
              borderRadius: 22,
              background: "#FFCB52",
              transform: "rotate(-4deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              top: 104,
              display: "flex",
              flexDirection: "column",
              width: 360,
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginLeft: 22,
                background: "#FFB526",
                color: "#07261F",
                fontSize: 19,
                fontWeight: 800,
                padding: "8px 16px",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              Your field
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: 250,
                borderRadius: 22,
                borderTopLeftRadius: 8,
                background: "#FFFFFF",
                padding: 28,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    background: "#0B362D",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#07261F" }}>
                    Your name
                  </div>
                  <div style={{ fontSize: 19, color: "#51645D" }}>Your role</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 26,
                  width: 230,
                  height: 12,
                  borderRadius: 6,
                  background: "#DAE9E1",
                }}
              />
              <div
                style={{
                  marginTop: 14,
                  width: 170,
                  height: 12,
                  borderRadius: 6,
                  background: "#DAE9E1",
                }}
              />
              <div
                style={{
                  marginTop: 14,
                  width: 200,
                  height: 12,
                  borderRadius: 6,
                  background: "#DAE9E1",
                }}
              />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 290,
              display: "flex",
              border: "4px solid #F09A0A",
              color: "#BD7404",
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "6px 16px",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 3,
              transform: "rotate(-11deg)",
            }}
          >
            ON FILE
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
