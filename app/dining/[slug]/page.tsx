import type { Metadata } from "next";
import { generateDiningPageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, JsonLd } from "@/lib/seo/structured-data";
import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: Promise<{ slug: string }>;
}

// Convert slug to display name
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const diningStyle = slugToName(slug);
  return generateDiningPageMetadata(diningStyle, slug);
}

export default async function DiningPage({ params }: Props) {
  const { slug } = await params;
  const diningStyle = slugToName(slug);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bestfoodwhere.sg" },
    { name: "Dining Styles", url: "https://bestfoodwhere.sg/dining" },
    { name: diningStyle, url: `https://bestfoodwhere.sg/dining/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ComingSoonPage
        title={`${diningStyle} Dining`}
        backHref="/"
        backLabel="Back to home"
      />
    </>
  );
}
