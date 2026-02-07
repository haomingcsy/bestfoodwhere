"use client";

import { useState, useEffect } from "react";
import type { RecipeData, TableOfContentsItem } from "@/types/recipe";
import {
  RecipeHero,
  RecipeTableOfContents,
  RecipeQuickFacts,
  RecipeNewsletterCard,
  RecipeIntroduction,
  RecipeIngredients,
  RecipeInstructions,
  RecipeDonenessTips,
  RecipeFAQ,
  RecipeFinalThoughts,
  RecipeVideo,
  RecipeEquipment,
} from "@/components/sections/recipe";

export interface RecipePageTemplateProps {
  recipe: RecipeData;
}

const TABLE_OF_CONTENTS: TableOfContentsItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "ingredients", label: "Ingredients You'll Need" },
  { id: "instructions", label: "Step-by-Step Instructions" },
  { id: "doneness", label: "How Do I Know It's Ready?" },
  { id: "faq", label: "FAQ" },
  { id: "final-thoughts", label: "Final Thoughts" },
];

export function RecipePageTemplate({ recipe }: RecipePageTemplateProps) {
  const [activeSection, setActiveSection] = useState("introduction");

  // Intersection observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    TABLE_OF_CONTENTS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            font-size: 12pt;
          }
          h1 {
            font-size: 18pt;
          }
          h2 {
            font-size: 14pt;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-8">
        {/* Hero Section */}
        <div className="lg:pr-[340px]">
          <RecipeHero recipe={recipe} />
        </div>

        {/* Three Column Layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr_320px]">
          {/* Left Sidebar - Table of Contents */}
          <aside className="no-print hidden lg:block">
            <div className="sticky top-24">
              <RecipeTableOfContents
                items={TABLE_OF_CONTENTS}
                activeSection={activeSection}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <div className="space-y-12">
              {/* Introduction */}
              <RecipeIntroduction
                content={recipe.content}
                title={recipe.title}
                introduction={recipe.enrichedContent?.introduction ?? undefined}
                whyLoveIt={recipe.enrichedContent?.whyLoveIt ?? undefined}
              />

              {/* Video (if available) */}
              {recipe.enrichedContent?.videoUrl && (
                <section className="no-print">
                  <h2 className="font-heading text-2xl font-bold text-gray-900">
                    Watch How It&apos;s Made
                  </h2>
                  <div className="mt-4">
                    <RecipeVideo
                      videoUrl={recipe.enrichedContent.videoUrl}
                      thumbnail={
                        recipe.enrichedContent.videoThumbnail ?? undefined
                      }
                      title={recipe.title}
                    />
                  </div>
                </section>
              )}

              {/* Ingredients */}
              <RecipeIngredients
                content={recipe.content}
                ingredients={recipe.enrichedContent?.ingredients}
              />

              {/* Instructions */}
              <RecipeInstructions
                content={recipe.content}
                instructions={recipe.enrichedContent?.instructions}
              />

              {/* Doneness Tips */}
              <RecipeDonenessTips
                content={recipe.content}
                title={recipe.title}
                donenessTips={recipe.enrichedContent?.donenessTips ?? undefined}
              />

              {/* FAQ */}
              <RecipeFAQ
                content={recipe.content}
                faqItems={recipe.enrichedContent?.faq}
              />

              {/* Final Thoughts */}
              <RecipeFinalThoughts
                content={recipe.content}
                title={recipe.title}
              />
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="no-print space-y-6 lg:space-y-0">
            <div className="sticky top-24 space-y-6">
              <RecipeQuickFacts
                quickFacts={recipe.quickFacts}
                slug={recipe.slug}
              />
              <RecipeEquipment
                equipment={recipe.enrichedContent?.equipment}
                categorySlug={recipe.categorySlug}
              />
              <RecipeNewsletterCard />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
