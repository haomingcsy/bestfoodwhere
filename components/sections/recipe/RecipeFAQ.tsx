"use client";

import { useState } from "react";
import { extractFAQ } from "@/lib/recipes";
import type { RecipeFAQItem } from "@/types/recipe";

interface RecipeFAQProps {
  content: string;
  faqItems?: RecipeFAQItem[];
}

export function RecipeFAQ({ content, faqItems }: RecipeFAQProps) {
  // Use enriched FAQ if available, otherwise extract from content
  const faqs = faqItems && faqItems.length > 0 ? faqItems : extractFAQ(content);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>

      <div className="mt-4 space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-400 transition-transform ${
        isOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
