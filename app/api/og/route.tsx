import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get parameters
  const type = searchParams.get("type") || "default";
  const title = searchParams.get("title");
  const subtitle = searchParams.get("subtitle");
  const cuisine = searchParams.get("cuisine");
  const mall = searchParams.get("mall");
  const rating = searchParams.get("rating");
  const slug = searchParams.get("slug");

  // Determine content based on type
  let mainTitle = "BestFoodWhere";
  let mainSubtitle = "Singapore's #1 Food Directory";
  let badge = "";

  switch (type) {
    case "restaurant":
      mainTitle = title || "Restaurant";
      mainSubtitle = subtitle || "View menu, reviews & hours";
      badge = rating ? `${rating} ★` : "";
      break;
    case "cuisine":
      mainTitle = cuisine ? `${cuisine} Restaurants` : "Cuisine";
      mainSubtitle = "in Singapore Malls";
      badge = "Cuisine Guide";
      break;
    case "mall":
      mainTitle = mall ? `${mall}` : "Shopping Mall";
      mainSubtitle = "Food Directory";
      badge = "Mall Guide";
      break;
    case "blog":
      mainTitle = title || "Blog";
      mainSubtitle = subtitle || "Food Stories & Guides";
      badge = "Article";
      break;
    default:
      mainTitle = "BestFoodWhere";
      mainSubtitle = "Discover 10,000+ restaurants across 19 Singapore malls";
      badge = "#1 Food Directory";
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #ff6a3d 0%, #ff8c66 50%, #ffb088 100%)",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top bar with logo and badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🍜
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "white",
              opacity: 0.95,
            }}
          >
            BestFoodWhere.sg
          </span>
        </div>

        {badge && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(10px)",
              padding: "10px 20px",
              borderRadius: "30px",
              fontSize: "18px",
              fontWeight: "600",
              color: "white",
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "white",
            lineHeight: 1.1,
            margin: 0,
            textShadow: "0 2px 20px rgba(0,0,0,0.1)",
            maxWidth: "900px",
          }}
        >
          {mainTitle}
        </h1>
        <p
          style={{
            fontSize: "32px",
            color: "white",
            opacity: 0.9,
            margin: 0,
            maxWidth: "800px",
          }}
        >
          {mainSubtitle}
        </p>
      </div>

      {/* Bottom bar with stats */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "white",
            }}
          >
            10,000+
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "white",
              opacity: 0.8,
            }}
          >
            Restaurants
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "white",
            }}
          >
            19
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "white",
              opacity: 0.8,
            }}
          >
            Shopping Malls
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "white",
            }}
          >
            50+
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "white",
              opacity: 0.8,
            }}
          >
            Cuisines
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
