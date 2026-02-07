"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  items: NavItem[];
  userType?: "consumer" | "restaurant";
}

export function DashboardSidebar({
  items,
  userType = "consumer",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-bfw-orange">
              BestFoodWhere
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition ${
                  isActive
                    ? "bg-bfw-orange/10 font-medium text-bfw-orange"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span
                  className={isActive ? "text-bfw-orange" : "text-gray-400"}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-center font-body text-xs text-gray-400">
            {userType === "restaurant"
              ? "Restaurant Portal"
              : "Member Dashboard"}
          </p>
        </div>
      </div>
    </aside>
  );
}
