import { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Forgot Password | BestFoodWhere",
  description: "Reset your BestFoodWhere account password",
};

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
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
