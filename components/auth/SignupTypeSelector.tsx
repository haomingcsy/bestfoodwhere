"use client";

import Link from "next/link";
import { IconUsers } from "@/components/layout/icons";

interface AccountTypeCardProps {
  type: "consumer" | "restaurant";
  title: string;
  description: string;
  benefits: string[];
  href: string;
  icon: React.ReactNode;
}

function AccountTypeCard({
  title,
  description,
  benefits,
  href,
  icon,
}: AccountTypeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-bfw-orange hover:shadow-md"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-bfw-orange/10 text-bfw-orange transition group-hover:bg-bfw-orange group-hover:text-white">
        {icon}
      </div>

      <h3 className="font-heading text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 font-body text-sm text-gray-600">{description}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-body text-sm text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-bfw-orange py-3 font-heading text-sm font-semibold text-white transition group-hover:bg-bfw-orange/90">
        Get Started
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

export function SignupTypeSelector() {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-gray-900">
          Join BestFoodWhere
        </h1>
        <p className="mt-2 font-body text-gray-600">
          Choose how you want to use BestFoodWhere
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AccountTypeCard
          type="consumer"
          title="Food Lover"
          description="Discover the best food in Singapore and save your favorites"
          benefits={[
            "Save your favorite restaurants",
            "Write and share reviews",
            "Access exclusive member deals",
            "Get personalized recommendations",
            "Join our foodie community",
          ]}
          href="/signup/consumer"
          icon={<IconUsers className="h-7 w-7" />}
        />

        <AccountTypeCard
          type="restaurant"
          title="Restaurant Owner"
          description="List your restaurant and reach thousands of food lovers"
          benefits={[
            "Create your restaurant listing",
            "Showcase your menu and photos",
            "Reach 50,000+ monthly visitors",
            "Get detailed analytics",
            "Run promotions and deals",
          ]}
          href="/signup/restaurant"
          icon={
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
      </div>

      <p className="mt-8 text-center font-body text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-bfw-orange hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
