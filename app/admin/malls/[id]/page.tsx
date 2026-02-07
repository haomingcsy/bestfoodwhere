import { ComingSoonPage } from "@/components/templates/ComingSoonPage";

interface Props {
  params: { id: string };
}

export default function AdminMallPage({ params }: Props) {
  return (
    <ComingSoonPage
      title={`Admin: Mall ${params.id}`}
      backHref="/admin/malls"
      backLabel="Back to malls"
    />
  );
}

