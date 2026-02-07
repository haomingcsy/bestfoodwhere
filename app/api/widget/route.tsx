import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";

/**
 * Embeddable Widget API
 *
 * Restaurants can embed a "Find us on BestFoodWhere" badge on their website.
 * This generates backlinks naturally as restaurants promote their listing.
 *
 * Usage:
 * <a href="https://bestfoodwhere.sg/menu/{slug}">
 *   <img src="https://bestfoodwhere.sg/api/widget?slug={slug}&style=badge" />
 * </a>
 *
 * Or use the script embed:
 * <script src="https://bestfoodwhere.sg/api/widget/embed.js" data-slug="{slug}"></script>
 */

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const style = searchParams.get("style") || "badge"; // badge, card, minimal
  const theme = searchParams.get("theme") || "light"; // light, dark

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#1f2937";
  const accentColor = "#f97316"; // BFW Orange

  if (style === "minimal") {
    // Minimal text-only badge
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
          backgroundColor: bgColor,
          borderRadius: "8px",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        }}
      >
        <span style={{ color: accentColor, fontWeight: "bold", fontSize: 14 }}>
          BestFoodWhere
        </span>
        <span style={{ color: textColor, fontSize: 14, marginLeft: 4 }}>
          Verified
        </span>
      </div>,
      {
        width: 160,
        height: 36,
      },
    );
  }

  if (style === "card") {
    // Larger card with more info
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          backgroundColor: bgColor,
          borderRadius: "16px",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <span style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              B
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: textColor, fontWeight: "bold", fontSize: 16 }}
            >
              BestFoodWhere
            </span>
            <span
              style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
            >
              Singapore Food Directory
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: accentColor,
            borderRadius: "8px",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          View Our Menu & Reviews →
        </div>
      </div>,
      {
        width: 280,
        height: 140,
      },
    );
  }

  // Default badge style
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        backgroundColor: bgColor,
        borderRadius: "12px",
        border: `2px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        <span style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          B
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ color: textColor, fontWeight: "bold", fontSize: 14 }}>
          Find us on
        </span>
        <span style={{ color: accentColor, fontWeight: "bold", fontSize: 16 }}>
          BestFoodWhere
        </span>
      </div>
    </div>,
    {
      width: 220,
      height: 60,
    },
  );
}
