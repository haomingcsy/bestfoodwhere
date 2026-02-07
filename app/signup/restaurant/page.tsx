import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RestaurantSignupForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "List Your Restaurant | BestFoodWhere",
  description:
    "List your restaurant on BestFoodWhere and reach thousands of food lovers in Singapore",
};

export default function RestaurantSignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Image
            src="/brand/logo.svg"
            alt="BestFoodWhere"
            width={140}
            height={32}
          />
        </Link>
        <Link
          href="/signup"
          className="font-body text-sm text-gray-600 hover:text-bfw-orange"
        >
          ← Back to options
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
            </div>
          }
        >
          <RestaurantSignupForm />
        </Suspense>
      </main>
    </div>
  );
}
