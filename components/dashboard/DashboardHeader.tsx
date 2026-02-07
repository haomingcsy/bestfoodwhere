"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  user?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({
  user,
  showMobileMenu,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {showMobileMenu ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Logo on mobile */}
      <Link href="/" className="lg:hidden">
        <span className="font-heading text-lg font-bold text-bfw-orange">
          BFW
        </span>
      </Link>

      {/* Spacer */}
      <div className="hidden flex-1 lg:block" />

      {/* User dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bfw-orange text-sm font-medium text-white">
              {initials}
            </div>
          )}
          <div className="hidden text-left lg:block">
            <p className="font-heading text-sm font-medium text-gray-900">
              {user?.displayName || "User"}
            </p>
            <p className="font-body text-xs text-gray-500">{user?.email}</p>
          </div>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
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
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href="/settings"
                className="block px-4 py-2 font-body text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/"
                className="block px-4 py-2 font-body text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Back to Site
              </Link>
              <hr className="my-1 border-gray-200" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full px-4 py-2 text-left font-body text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
