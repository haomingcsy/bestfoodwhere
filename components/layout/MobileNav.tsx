"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconX } from "./icons";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

interface NavSection {
  label: string;
  href?: string;
  items?: NavLink[];
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  ctaHref: string;
}

export function MobileNav({
  isOpen,
  onClose,
  sections,
  ctaHref,
}: MobileNavProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const sectionKeys = useMemo(() => sections.map((s) => s.label), [sections]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setOpenSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      for (const k of sectionKeys) next[k] = next[k] ?? false;
      return next;
    });
  }, [isOpen, sectionKeys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <span className="font-heading font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <Link
            href={ctaHref}
            onClick={onClose}
            className="block w-full rounded-xl bg-bfw-red px-4 py-3 text-center font-semibold text-white hover:bg-[#d32f2f] transition-colors"
          >
            List Your Restaurant
          </Link>
        </div>

        <nav className="px-2 pb-6">
          {sections.map((section) => {
            const hasItems = (section.items?.length ?? 0) > 0;
            const isExpanded = !!openSections[section.label];

            return (
              <div key={section.label} className="px-2">
                <div className="flex items-center justify-between">
                  {section.href ? (
                    <Link
                      href={section.href}
                      onClick={onClose}
                      className="flex-1 rounded-lg px-3 py-3 font-medium hover:bg-gray-100"
                    >
                      {section.label}
                    </Link>
                  ) : (
                    <span className="flex-1 rounded-lg px-3 py-3 font-medium text-gray-900">
                      {section.label}
                    </span>
                  )}

                  {hasItems ? (
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      aria-label={`Toggle ${section.label}`}
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [section.label]: !prev[section.label],
                        }))
                      }
                    >
                      <IconChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : null}
                </div>

                {hasItems && isExpanded ? (
                  <div className="mb-2 ml-2 border-l border-border pl-2">
                    {section.items!.map((item) =>
                      item.external ? (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={onClose}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
