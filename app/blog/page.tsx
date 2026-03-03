import { Metadata } from "next";
import { ComingSoonPage } from "@/components/templates/ComingSoonPage";
import { generateStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateStaticPageMetadata(
  "Blog - Food News, Reviews & Dining Tips",
  "Stories, reviews, and insider tips about Singapore's restaurant scene. From hidden gems in shopping malls to the latest food trends and openings.",
  "/blog"
);

export default function BlogPage() {
  return <ComingSoonPage title="Blog" backHref="/" backLabel="Back to home" />;
}

