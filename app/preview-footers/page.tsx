"use client";

import { useState } from "react";
import { FooterA } from "./FooterA";
import { FooterB } from "./FooterB";
import { FooterC } from "./FooterC";
import { FooterD } from "./FooterD";

const VARIATIONS = [
  { id: "A", name: "Minimal Light", description: "Clean white background with subtle shadows" },
  { id: "B", name: "Bold Gradient", description: "Orange to navy gradient with card-style form" },
  { id: "C", name: "Dark Modern", description: "Black with glassmorphism effects" },
  { id: "D", name: "Split Design", description: "Orange VIP banner + navy links section" },
];

export default function PreviewFootersPage() {
  const [activeVariation, setActiveVariation] = useState("A");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Selector */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="mb-4 font-heading text-2xl font-bold text-gray-900">
            Footer Variations Preview
          </h1>
          <div className="flex flex-wrap gap-3">
            {VARIATIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVariation(v.id)}
                className={`rounded-lg px-4 py-2 font-heading text-sm font-medium transition ${
                  activeVariation === v.id
                    ? "bg-bfw-orange text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {v.id}: {v.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {VARIATIONS.find((v) => v.id === activeVariation)?.description}
          </p>
        </div>
      </div>

      {/* Preview Area */}
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 rounded-lg bg-white p-4 text-center text-gray-400">
            [Page content would appear here]
          </div>
        </div>

        {/* Footer Preview */}
        {activeVariation === "A" && <FooterA />}
        {activeVariation === "B" && <FooterB />}
        {activeVariation === "C" && <FooterC />}
        {activeVariation === "D" && <FooterD />}
      </div>
    </div>
  );
}
