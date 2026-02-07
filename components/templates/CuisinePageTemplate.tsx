interface CuisineSummary {
  name: string;
  slug: string;
}

export interface CuisinePageTemplateProps {
  cuisine: CuisineSummary;
}

export function CuisinePageTemplate({ cuisine }: CuisinePageTemplateProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {cuisine.name}
      </h1>
      <p className="mt-2 text-[15px] text-gray-600">Template placeholder.</p>
    </section>
  );
}

