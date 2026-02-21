interface Props {
  description: string;
  isMissing?: boolean;
}

export function DescriptionSection({ description, isMissing }: Props) {
  const trimmed = description.trim();

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="mb-5">
        <h2 className="text-[26px] font-bold text-gray-900">Description</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
      </div>
      {trimmed ? (
        <p className="text-[15px] leading-7 text-gray-700 whitespace-pre-line">{trimmed}</p>
      ) : isMissing ? (
        <p className="text-[15px] leading-7 text-gray-500">
          Description coming soon.
        </p>
      ) : null}
    </section>
  );
}
