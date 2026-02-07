"use client";

import { useState } from "react";
import Link from "next/link";

const FOOTER_LINKS = {
  findFood: [
    { href: "/postal-code-food-finder", label: "Postal Code Finder" },
    { href: "/promotions-and-deals", label: "Food Deals" },
    { href: "/cuisine/all", label: "Cuisines" },
    { href: "/dining/all", label: "Dining Type" },
  ],
  shoppingMalls: [
    { href: "/shopping-malls", label: "All Malls" },
    { href: "/shopping-malls/jewel", label: "Jewel Changi" },
    { href: "/shopping-malls/vivocity", label: "VivoCity" },
    { href: "/shopping-malls/marina-bay-sands", label: "Marina Bay Sands" },
  ],
  foodGuides: [
    { href: "/reviews", label: "Reviews" },
    { href: "/restaurant-highlights", label: "Restaurant Highlights" },
    { href: "/dining-guides", label: "Dining Guides" },
    { href: "/menus", label: "Menus" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact-us", label: "Contact Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

// VARIATION A: Minimal Light
export function FooterA() {
  const year = new Date().getFullYear();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  return (
    <footer className="w-full bg-white">
      {/* VIP Section */}
      <div className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Join Our <span className="text-bfw-orange">VIP Club</span>
              </h2>
              <p className="mt-2 font-body text-gray-600">
                Get exclusive deals from 200+ restaurants delivered weekly.
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="h-12 flex-1 rounded-lg border border-gray-200 px-4 font-body text-sm outline-none focus:border-bfw-orange focus:ring-2 focus:ring-bfw-orange/20"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="h-12 flex-1 rounded-lg border border-gray-200 px-4 font-body text-sm outline-none focus:border-bfw-orange focus:ring-2 focus:ring-bfw-orange/20"
              />
              <button
                type="submit"
                className="h-12 rounded-lg bg-bfw-orange px-6 font-heading text-sm font-semibold text-white transition hover:bg-bfw-orange-hover"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
              Find Food
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.findFood.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-body text-sm text-gray-600 hover:text-bfw-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
              Shopping Malls
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.shoppingMalls.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-body text-sm text-gray-600 hover:text-bfw-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
              Food Guides
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.foodGuides.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-body text-sm text-gray-600 hover:text-bfw-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-body text-sm text-gray-600 hover:text-bfw-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
          <p className="font-body text-sm text-gray-500">
            © {year} BestFoodWhere. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-bfw-orange">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.5H7.1v-3.4h3V9.5c0-3 1.8-4.7 4.5-4.7c1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9v2.3h3.3l-.5 3.4h-2.8V24C19.6 23.1 24 18.1 24 12.1z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-bfw-orange">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.9-.1M12 0C8.7 0 8.3 0 7 .1 5.7.2 4.7.4 3.9.7c-.9.3-1.6.8-2.3 1.5C.9 2.9.4 3.6.1 4.5-.2 5.3 0 6.3 0 7.6 0 8.9 0 9.3 0 12.6s0 3.7.1 5c.1 1.3.3 2.3.6 3.1.3.9.8 1.6 1.5 2.3.7.7 1.4 1.2 2.3 1.5.8.3 1.8.5 3.1.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.3-.3 3.1-.6.9-.3 1.6-.8 2.3-1.5.7-.7 1.2-1.4 1.5-2.3.3-.8.5-1.8.6-3.1.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.3-.6-3.1-.3-.9-.8-1.6-1.5-2.3-.7-.7-1.4-1.2-2.3-1.5-.8-.3-1.8-.5-3.1-.6C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-10.9a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
