"use client";

import { AREA_FILTERS, type SingaporeArea } from "@/types/dining";

interface FilterSectionProps {
  currentArea: SingaporeArea;
  onAreaChange: (area: SingaporeArea) => void;
}

export function FilterSection({
  currentArea,
  onAreaChange,
}: FilterSectionProps) {
  return (
    <div className="my-5 flex flex-wrap justify-center gap-2 rounded-xl bg-[#f9f9f9] p-4">
      {AREA_FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          title={filter.tooltip}
          onClick={() => onAreaChange(filter.value)}
          className={`relative rounded-full border px-4 py-2 font-body text-sm transition-all ${
            currentArea === filter.value
              ? "border-bfw-orange bg-bfw-orange text-white"
              : "border-[#ddd] bg-white text-[#333] hover:border-bfw-orange/50"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
