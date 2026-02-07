"use client";

import { useState } from "react";

interface SearchSectionProps {
  onSearch: (term: string) => void;
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="mb-5 rounded-xl bg-white p-5 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
      <div className="flex justify-center">
        <div className="flex w-full max-w-[600px] overflow-hidden rounded-full border border-[#ddd] shadow-[0_3px_8px_rgba(0,0,0,0.05)]">
          <input
            type="text"
            placeholder="Search for cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow border-none px-5 py-3 font-body text-base outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="bg-bfw-orange px-6 font-heading font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
