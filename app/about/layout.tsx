import type { Metadata } from "next";
import { generateOrganizationSchema, JsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "About Us - Our Story & Mission",
  description:
    "Learn about BestFoodWhere, Singapore's leading food directory. Discover our mission to help you find the best restaurants in shopping malls across Singapore.",
  keywords: [
    "BestFoodWhere",
    "about us",
    "Singapore food directory",
    "restaurant guide Singapore",
    "food discovery",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/about",
  },
  openGraph: {
    title: "About BestFoodWhere - Singapore's #1 Food Directory",
    description:
      "Learn about our mission to help Singaporeans discover the best restaurants in shopping malls.",
    url: "https://bestfoodwhere.sg/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <JsonLd data={organizationSchema} />
      {children}
    </>
  );
}
