import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Discover Singapore's best restaurants, menus, and deals on BestFoodWhere.",
  robots: { index: false, follow: true },
};

const popularLinks = [
  { href: "/cuisine/all", label: "Browse All Cuisines" },
  { href: "/shopping-malls", label: "Shopping Mall Dining" },
  { href: "/promotions-and-deals", label: "Latest Deals" },
  { href: "/postal-code-food-finder", label: "Find Food Near Me" },
  { href: "/recipes", label: "Recipes" },
  { href: "/blog", label: "Blog" },
];

const topCuisines = [
  { href: "/cuisine/japanese", label: "Japanese" },
  { href: "/cuisine/korean", label: "Korean" },
  { href: "/cuisine/chinese", label: "Chinese" },
  { href: "/cuisine/western", label: "Western" },
  { href: "/cuisine/thai", label: "Thai" },
  { href: "/cuisine/italian", label: "Italian" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-heading text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 font-heading text-xl text-gray-600">
        Oops! This page doesn&apos;t exist.
      </p>
      <p className="mt-2 font-body text-gray-500">
        The page you&apos;re looking for may have been moved or removed. Let us
        help you find what you&apos;re craving.
      </p>

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-bfw-red px-8 py-3 font-heading text-base font-semibold text-white shadow-sm transition hover:bg-[#d32f2f]"
        >
          Back to Home
        </Link>
      </div>

      <div className="mt-14 grid gap-8 text-left sm:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-900">
            Popular Pages
          </h2>
          <ul className="mt-4 space-y-3">
            {popularLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-bfw-orange hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-900">
            Top Cuisines
          </h2>
          <ul className="mt-4 space-y-3">
            {topCuisines.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-bfw-orange hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-14 font-body text-sm text-gray-400">
        Looking for a specific restaurant?{" "}
        <Link href="/?q=" className="text-bfw-orange hover:underline">
          Try our search
        </Link>
      </p>
    </div>
  );
}
