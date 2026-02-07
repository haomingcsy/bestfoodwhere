import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: { id: string };
}

export default function AdminRecipePage({ params }: Props) {
  return (
    <ComingSoonPage
      title={`Admin: Recipe ${params.id}`}
      backHref="/admin/recipes"
      backLabel="Back to recipes"
    />
  );
}

