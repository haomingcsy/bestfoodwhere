import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Join Our Team",
  description:
    "Join BestFoodWhere and help build Singapore's #1 food directory. Explore career opportunities in marketing, technology, content, and operations.",
  keywords: [
    "BestFoodWhere careers",
    "food tech jobs Singapore",
    "startup jobs Singapore",
    "food industry careers",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/careers",
  },
  openGraph: {
    title: "Careers at BestFoodWhere",
    description:
      "Join our team and help Singaporeans discover their next favorite meal.",
    url: "https://bestfoodwhere.sg/careers",
    type: "website",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
