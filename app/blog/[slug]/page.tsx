import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: { slug: string };
}

export default function BlogPostPage({ params }: Props) {
  return (
    <ComingSoonPage
      title={`Blog Post: ${params.slug}`}
      backHref="/blog"
      backLabel="Back to blog"
    />
  );
}

