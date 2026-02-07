import type { Metadata } from "next";
import Link from "next/link";
import { generateFAQSchema, JsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about BestFoodWhere - Singapore's food directory. Learn about restaurant listings, finding food near you, partnerships, and more.",
  keywords: [
    "BestFoodWhere FAQ",
    "food directory help",
    "restaurant listing questions",
    "Singapore food guide",
  ],
  alternates: {
    canonical: "https://bestfoodwhere.sg/faq",
  },
  openGraph: {
    title: "FAQ - BestFoodWhere",
    description:
      "Answers to common questions about Singapore's #1 food directory.",
    url: "https://bestfoodwhere.sg/faq",
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    question: "What is BestFoodWhere?",
    answer:
      "BestFoodWhere is Singapore's most comprehensive food and restaurant directory, specializing in mall-based dining. We help you discover 10,000+ restaurants across 19 major shopping malls, with detailed menus, opening hours, reviews, and exclusive deals.",
  },
  {
    question: "How do I find restaurants near me?",
    answer:
      "Use our Postal Code Food Finder feature! Simply enter your postal code, and we'll show you the nearest shopping malls and their restaurants. You can also browse by cuisine type, dining style, or specific mall.",
  },
  {
    question: "How can I list my restaurant on BestFoodWhere?",
    answer:
      "Listing your restaurant is easy! Visit our Advertise page or contact us via the contact form. Our team will review your submission and get your restaurant listed within 2-3 business days. Premium listing options with enhanced visibility are also available.",
  },
  {
    question: "Is BestFoodWhere free to use?",
    answer:
      "Yes! BestFoodWhere is completely free for diners. You can browse restaurants, view menus, check opening hours, and read reviews at no cost. Restaurant owners can also get a basic listing for free.",
  },
  {
    question: "How do I report incorrect information about a restaurant?",
    answer:
      "We strive for accuracy across our platform. If you spot any incorrect information, please use our contact form and select 'Technical Support' as the subject. Include the restaurant name, location, and what needs correction. Our content team will verify and update promptly.",
  },
  {
    question: "How can I partner with BestFoodWhere for promotions?",
    answer:
      "We offer various partnership opportunities for restaurants, food brands, and mall operators. These include featured listings, promotional deals, banner advertisements, and co-branded marketing campaigns. Visit our Partnership page or contact partnerships@bestfoodwhere.sg.",
  },
  {
    question: "Do you cover restaurants outside of shopping malls?",
    answer:
      "While we initially focused on mall dining options, we're expanding our coverage to include standalone restaurants, food courts, and other dining establishments across Singapore. Stay tuned for our comprehensive coverage of Singapore's entire food scene!",
  },
  {
    question: "How often is restaurant information updated?",
    answer:
      "Our database is updated weekly. We verify opening hours, menu prices, and contact information regularly. Restaurant owners can also update their own listings anytime through our platform.",
  },
  {
    question: "Can I save my favorite restaurants?",
    answer:
      "Yes! Create a free account to save your favorite restaurants, write reviews, and get personalized recommendations based on your dining preferences.",
  },
  {
    question: "How do I subscribe to your newsletter?",
    answer:
      "Enter your email in the subscription box at the bottom of our homepage. Our newsletter includes the latest restaurant openings, exclusive deals, food trends, and dining recommendations in Singapore.",
  },
  {
    question: "What cuisines do you cover?",
    answer:
      "We cover 50+ cuisine types including Japanese, Chinese, Korean, Western, Thai, Indian, Malay, Indonesian, Vietnamese, Italian, French, Mexican, Mediterranean, and many more. You can filter restaurants by cuisine type on our listing page.",
  },
  {
    question: "Do you have information about halal restaurants?",
    answer:
      "Yes! We clearly indicate halal-certified restaurants in our listings. You can filter specifically for halal options when browsing our directory.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-heading text-lg font-semibold text-gray-900 pr-4">
          {question}
        </span>
        <span
          className={`flex-shrink-0 text-bfw-orange transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="font-body text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQClient() {
  "use client";
  // This would need useState but we're keeping it simple for SEO
  // In production, make this a client component
  return null;
}

export default function FAQPage() {
  const faqSchema = generateFAQSchema(FAQ_ITEMS);

  return (
    <>
      <JsonLd data={faqSchema} />

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-bfw-orange to-orange-500 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 font-body text-lg text-white/90">
              Find answers to common questions about BestFoodWhere
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              {FAQ_ITEMS.map((item, index) => (
                <details
                  key={index}
                  className="group border-b border-gray-200 last:border-b-0"
                >
                  <summary className="flex cursor-pointer items-center justify-between py-5 text-left list-none">
                    <span className="font-heading text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 text-bfw-orange transition-transform group-open:rotate-180">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-5">
                    <p className="font-body text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-12 text-center">
              <p className="font-body text-gray-600">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-bfw-orange px-6 py-3 font-heading font-semibold text-white transition-colors hover:bg-bfw-orange-hover"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
