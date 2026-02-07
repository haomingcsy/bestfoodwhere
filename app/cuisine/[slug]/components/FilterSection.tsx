"use client";

import type { SingaporeArea } from "@/types/dining";

interface FilterSectionProps {
  currentArea: SingaporeArea;
  onAreaChange: (area: SingaporeArea) => void;
}

const AREA_FILTERS: { value: SingaporeArea; label: string; tooltip: string }[] =
  [
    { value: "all", label: "All Regions", tooltip: "All areas in Singapore" },
    {
      value: "central",
      label: "Central",
      tooltip:
        "Districts 01-08, 09-13 (Raffles Place, Orchard, River Valley, Chinatown)",
    },
    {
      value: "east",
      label: "East",
      tooltip: "Districts 14-18 (Geylang, Katong, Bedok, Tampines, Pasir Ris)",
    },
    {
      value: "west",
      label: "West",
      tooltip: "Districts 22-24 (Jurong, Boon Lay, Choa Chu Kang)",
    },
    {
      value: "north",
      label: "North",
      tooltip:
        "Districts 25-28 (Kranji, Woodgrove, Yishun, Sembawang, Seletar)",
    },
    {
      value: "north-east",
      label: "North-East",
      tooltip: "Districts 19-20, 28 (Serangoon, Hougang, Punggol, Seletar)",
    },
    {
      value: "south",
      label: "South",
      tooltip: "Districts 01-02 (Raffles Place, Tanjong Pagar, Marina Bay)",
    },
  ];

export function FilterSection({
  currentArea,
  onAreaChange,
}: FilterSectionProps) {
  return (
    <section className="mb-5 flex flex-wrap justify-center gap-2 rounded-xl bg-[#f9f9f9] p-4">
      {AREA_FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onAreaChange(filter.value)}
          title={filter.tooltip}
          className={`rounded-full border px-4 py-2 font-body text-sm transition-all ${
            currentArea === filter.value
              ? "border-bfw-orange bg-bfw-orange text-white"
              : "border-[#ddd] bg-white text-[#333] hover:border-bfw-orange hover:text-bfw-orange"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </section>
  );
}
