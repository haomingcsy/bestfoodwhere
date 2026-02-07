"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MALLS_DATA } from "@/lib/mall-data";
import { IconSearch } from "@/components/layout/icons";

interface MallHeroSearchProps {
  onSearch?: (query: string) => void;
}

export function MallHeroSearch({ onSearch }: MallHeroSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const filteredMalls = MALLS_DATA.filter(
    (mall) =>
      mall.name.toLowerCase().includes(query.toLowerCase()) ||
      mall.location.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (slug: string) => {
    router.push(`/shopping-malls/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredMalls.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredMalls[highlightedIndex]) {
          handleSelect(filteredMalls[highlightedIndex].slug);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
        <IconSearch className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search malls or areas (e.g., 'VivoCity')"
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-base"
          aria-label="Search for malls or areas"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
      </div>

      {isOpen && filteredMalls.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl max-h-[280px] overflow-y-auto z-50"
          role="listbox"
        >
          {filteredMalls.map((mall, index) => (
            <li
              key={mall.slug}
              role="option"
              aria-selected={highlightedIndex === index}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                highlightedIndex === index ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelect(mall.slug)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="font-medium text-gray-900">{mall.name}</div>
              <div className="text-sm text-gray-500">{mall.location}</div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query && filteredMalls.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl p-4 text-center text-gray-500">
          No malls found matching &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
