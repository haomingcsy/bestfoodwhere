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

// VARIATION B: Bold Gradient
export function FooterB() {
  const year = new Date().getFullYear();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  return (
    <footer className="w-full">
      {/* VIP Section - Orange Gradient */}
      <div className="bg-gradient-to-r from-bfw-orange to-[#ff8c66]">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="grid items-center gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wider text-white">
                VIP Members Only
              </span>
              <h2 className="mt-4 font-heading text-3xl font-bold text-white">
                Unlock Exclusive Food Deals
              </h2>
              <p className="mt-2 font-body text-white/80">
                Join 10,000+ foodies getting weekly deals from 200+ restaurants.
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-12 rounded-lg border border-gray-200 px-4 font-body text-sm outline-none focus:border-bfw-orange"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="h-12 rounded-lg border border-gray-200 px-4 font-body text-sm outline-none focus:border-bfw-orange"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="h-12 rounded-lg border border-gray-200 px-4 font-body text-sm outline-none focus:border-bfw-orange"
                  />
                  <button
                    type="submit"
                    className="h-12 rounded-lg bg-gradient-to-r from-bfw-orange to-[#ff8c66] font-heading text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
                  >
                    Join Free
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links - Navy */}
      <div className="bg-[#1d2b44]">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Find Food</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.findFood.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-body text-sm text-white/60 hover:text-bfw-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Shopping Malls</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.shoppingMalls.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-body text-sm text-white/60 hover:text-bfw-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Food Guides</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.foodGuides.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-body text-sm text-white/60 hover:text-bfw-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.company.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-body text-sm text-white/60 hover:text-bfw-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="font-body text-sm text-white/50">© {year} BestFoodWhere</p>
            <div className="flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-bfw-orange hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.5H7.1v-3.4h3V9.5c0-3 1.8-4.7 4.5-4.7c1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9v2.3h3.3l-.5 3.4h-2.8V24C19.6 23.1 24 18.1 24 12.1z"/></svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-bfw-orange hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.9-.1M12 0C8.7 0 8.3 0 7 .1 5.7.2 4.7.4 3.9.7c-.9.3-1.6.8-2.3 1.5C.9 2.9.4 3.6.1 4.5-.2 5.3 0 6.3 0 7.6 0 8.9 0 9.3 0 12.6s0 3.7.1 5c.1 1.3.3 2.3.6 3.1.3.9.8 1.6 1.5 2.3.7.7 1.4 1.2 2.3 1.5.8.3 1.8.5 3.1.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.3-.3 3.1-.6.9-.3 1.6-.8 2.3-1.5.7-.7 1.2-1.4 1.5-2.3.3-.8.5-1.8.6-3.1.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.3-.6-3.1-.3-.9-.8-1.6-1.5-2.3-.7-.7-1.4-1.2-2.3-1.5-.8-.3-1.8-.5-3.1-.6C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-10.9a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"/></svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-bfw-orange hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.1 3.17 9.46 7.64 11.22c-.1-.95-.18-2.4.04-3.44l1.56-6.63s-.4-.8-.4-2c0-1.88 1.09-3.29 2.45-3.29c1.16 0 1.72.87 1.72 1.9c0 1.16-.74 2.9-1.12 4.5c-.33 1.35.7 2.45 2.06 2.45c2.47 0 4.12-3.18 4.12-6.95c0-2.86-1.93-5-5.44-5c-3.96 0-6.43 2.95-6.43 6.25c0 1.14.33 1.95.86 2.58c.24.28.27.39.18.71c-.06.24-.2.8-.26 1.03c-.09.34-.35.46-.64.33c-1.79-.73-2.62-2.68-2.62-4.88c0-3.63 3.06-7.98 9.12-7.98c4.88 0 8.09 3.52 8.09 7.3c0 5-2.78 8.73-6.88 8.73c-1.38 0-2.68-.75-3.12-1.6l-.85 3.23c-.3 1.08-.88 2.43-1.32 3.25c1.18.36 2.43.56 3.72.56c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
