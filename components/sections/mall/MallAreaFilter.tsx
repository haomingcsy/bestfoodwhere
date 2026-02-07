"use client";

import { MALL_AREAS, MallAreaValue } from "@/lib/mall-data";

interface MallAreaFilterProps {
  selectedArea: MallAreaValue;
  onAreaChange: (area: MallAreaValue) => void;
}

export function MallAreaFilter({
  selectedArea,
  onAreaChange,
}: MallAreaFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-gray-50 py-6">
      {/* Mobile dropdown */}
      <select
        value={selectedArea}
        onChange={(e) => onAreaChange(e.target.value as MallAreaValue)}
        className="w-full md:hidden px-4 py-4 bg-white border border-gray-200 rounded-xl text-base font-medium text-gray-900 appearance-none cursor-pointer shadow-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 16px center",
          backgroundSize: "18px",
          paddingRight: "48px",
        }}
        aria-label="Select area"
      >
        {MALL_AREAS.map((area) => (
          <option key={area.value} value={area.value}>
            {area.label}
          </option>
        ))}
      </select>

      {/* Desktop buttons */}
      <div
        className="hidden md:flex flex-wrap gap-3 justify-center"
        role="tablist"
        aria-label="Filter by area"
      >
        {MALL_AREAS.map((area) => (
          <button
            key={area.value}
            onClick={() => onAreaChange(area.value)}
            className={`px-6 py-3 rounded-full text-[15px] font-medium transition-all shadow-sm ${
              selectedArea === area.value
                ? "bg-bfw-red text-white shadow-md"
                : "bg-white text-gray-600 hover:shadow-md hover:-translate-y-0.5"
            }`}
            role="tab"
            aria-selected={selectedArea === area.value}
          >
            {area.label}
          </button>
        ))}
      </div>
    </div>
  );
}
