import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise Your Restaurant",
  description:
    "List your restaurant on BestFoodWhere and reach thousands of hungry diners in Singapore. Choose from free basic listings to premium featured placements.",
  keywords: [
    "advertise restaurant Singapore",
    "restaurant listing",
    "promote restaurant",
    "food directory advertising",
    "mall restaurant listing",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/advertise",
  },
  openGraph: {
    title: "Advertise on BestFoodWhere",
    description:
      "Get your restaurant in front of thousands of diners searching for their next meal.",
    url: "https://bestfoodwhere.sg/advertise",
    type: "website",
  },
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
