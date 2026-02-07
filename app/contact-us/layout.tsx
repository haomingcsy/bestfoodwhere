import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch",
  description:
    "Contact BestFoodWhere for restaurant listings, partnerships, advertising, or support. We're here to help you discover Singapore's best mall dining options.",
  keywords: [
    "contact BestFoodWhere",
    "restaurant listing Singapore",
    "food directory contact",
    "partnership inquiry",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/contact-us",
  },
  openGraph: {
    title: "Contact BestFoodWhere",
    description:
      "Get in touch for restaurant listings, partnerships, or support.",
    url: "https://bestfoodwhere.sg/contact-us",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
