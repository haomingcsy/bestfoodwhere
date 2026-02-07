import { Metadata } from "next";
import Link from "next/link";
import { SignupTypeSelector } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign Up | BestFoodWhere",
  description: "Create your BestFoodWhere account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; message?: string }>;
}) {
  const params = await searchParams;
  const message = params.message;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-bfw-orange">
            BestFoodWhere
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {message && (
            <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm text-blue-700">
              {message}
            </div>
          )}
          <SignupTypeSelector />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="font-body text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BestFoodWhere. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
