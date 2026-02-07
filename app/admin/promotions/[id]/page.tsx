import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: { id: string };
}

export default function AdminPromotionPage({ params }: Props) {
  return (
    <ComingSoonPage
      title={`Admin: Promotion ${params.id}`}
      backHref="/admin/promotions"
      backLabel="Back to promotions"
    />
  );
}

