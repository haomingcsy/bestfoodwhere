import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: { id: string };
}

export default function AdminBrandPage({ params }: Props) {
  return (
    <ComingSoonPage
      title={`Admin: Brand ${params.id}`}
      backHref="/admin/brands"
      backLabel="Back to brands"
    />
  );
}

