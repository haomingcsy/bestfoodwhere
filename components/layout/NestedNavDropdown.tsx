"use client";

import Link from "next/link";
import { IconChevronDown } from "./icons";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

interface NavItemWithSubmenu {
  href?: string;
  label: string;
  items?: NavLink[];
}

interface NestedNavDropdownProps {
  label: string;
  items: (NavLink | NavItemWithSubmenu)[];
}

function isNavItemWithSubmenu(
  item: NavLink | NavItemWithSubmenu,
): item is NavItemWithSubmenu {
  return "items" in item && Array.isArray(item.items);
}

export function NestedNavDropdown({ label, items }: NestedNavDropdownProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="inline-flex items-center gap-1 px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors"
        aria-haspopup="menu"
      >
        {label}
        <IconChevronDown className="h-4 w-4 opacity-80" />
      </button>

      <div className="pointer-events-none absolute left-0 top-full pt-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
        <div className="w-64 rounded-2xl border border-border bg-white p-2 shadow-xl">
          {items.map((item) => {
            if (
              isNavItemWithSubmenu(item) &&
              item.items &&
              item.items.length > 0
            ) {
              // Item with submenu
              return (
                <div key={item.label} className="relative group/sub">
                  <div className="flex items-center justify-between">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex-1 rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="flex-1 rounded-xl px-3 py-2 text-sm text-gray-800">
                        {item.label}
                      </span>
                    )}
                    <IconChevronDown className="h-4 w-4 -rotate-90 text-gray-400 mr-2" />
                  </div>

                  {/* Submenu */}
                  <div className="pointer-events-none absolute left-full top-0 pl-2 opacity-0 transition-opacity duration-150 group-hover/sub:opacity-100 group-hover/sub:pointer-events-auto">
                    <div className="w-56 max-h-80 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
                      {item.items.map((subItem) =>
                        subItem.external ? (
                          <a
                            key={subItem.href}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
                          >
                            {subItem.label}
                          </a>
                        ) : (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular link without submenu
            const regularItem = item as NavLink;
            return regularItem.external ? (
              <a
                key={regularItem.href}
                href={regularItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
              >
                {regularItem.label}
              </a>
            ) : (
              <Link
                key={regularItem.href}
                href={regularItem.href}
                className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
              >
                {regularItem.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
