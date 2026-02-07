import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnership Opportunities",
  description:
    "Partner with BestFoodWhere, Singapore's leading food directory. Explore collaboration opportunities for restaurants, malls, food brands, and media partners.",
  keywords: [
    "BestFoodWhere partnership",
    "restaurant partnership Singapore",
    "food directory collaboration",
    "mall partnership",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/partnership",
  },
  openGraph: {
    title: "Partner with BestFoodWhere",
    description:
      "Explore partnership opportunities with Singapore's #1 food directory.",
    url: "https://bestfoodwhere.sg/partnership",
    type: "website",
  },
};

export default function PartnershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
