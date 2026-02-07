"use client";

import type { TableOfContentsItem } from "@/types/recipe";

interface RecipeTableOfContentsProps {
  items: TableOfContentsItem[];
  activeSection: string;
}

export function RecipeTableOfContents({
  items,
  activeSection,
}: RecipeTableOfContentsProps) {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-gray-900">
        On This Page
      </h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollTo(item.id)}
              className={`w-full text-left text-[14px] transition-colors duration-200 ${
                activeSection === item.id
                  ? "font-semibold text-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
