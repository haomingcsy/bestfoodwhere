"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MobileNav } from "./MobileNav";
import {
  IconChevronDown,
  IconFacebook,
  IconInstagram,
  IconMenu,
  IconPinterest,
  IconPin,
  IconSearch,
  IconUser,
} from "./icons";
import { NestedNavDropdown } from "./NestedNavDropdown";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

interface NavDropdownProps {
  label: string;
  href?: string;
  items: NavLink[];
}

function NavDropdown({ label, href, items }: NavDropdownProps) {
  return (
    <div className="relative group">
      <div className="flex items-center gap-1">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors"
          >
            {label}
            <IconChevronDown className="h-4 w-4 opacity-80" />
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors"
            aria-haspopup="menu"
          >
            {label}
            <IconChevronDown className="h-4 w-4 opacity-80" />
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute left-0 top-full pt-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
        <div className="w-64 rounded-2xl border border-border bg-white p-2 shadow-xl">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-bfw-orange transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const ctaHref = "/advertise";

  // Shopping mall submenu items - all 19 malls
  const shoppingMallItems = useMemo<NavLink[]>(
    () => [
      { href: "/shopping-malls/suntec-city", label: "Suntec City" },
      { href: "/shopping-malls/vivocity", label: "VivoCity" },
      { href: "/shopping-malls/plaza-singapura", label: "Plaza Singapura" },
      { href: "/shopping-malls/marina-bay-sands", label: "Marina Bay Sands" },
      {
        href: "/shopping-malls/velocity-novena-square",
        label: "Velocity Novena Square",
      },
      { href: "/shopping-malls/united-square", label: "United Square" },
      { href: "/shopping-malls/woodleigh-mall", label: "Woodleigh Mall" },
      { href: "/shopping-malls/junction-8", label: "Junction 8" },
      { href: "/shopping-malls/city-square-mall", label: "City Square Mall" },
      { href: "/shopping-malls/amk-hub", label: "AMK Hub" },
      { href: "/shopping-malls/causeway-point", label: "Causeway Point" },
      { href: "/shopping-malls/nex", label: "NEX" },
      { href: "/shopping-malls/bedok-mall", label: "Bedok Mall" },
      { href: "/shopping-malls/hougang-mall", label: "Hougang Mall" },
      { href: "/shopping-malls/tampines-mall", label: "Tampines Mall" },
      { href: "/shopping-malls/jewel", label: "Jewel Changi" },
      { href: "/shopping-malls/imm", label: "IMM" },
      { href: "/shopping-malls/jem", label: "JEM" },
      { href: "/shopping-malls/aperia-mall", label: "Aperia Mall" },
    ],
    [],
  );

  // Dining options submenu items - all 6 dining styles
  const diningItems = useMemo<NavLink[]>(
    () => [
      { href: "/dining/fine-dining", label: "Fine Dining" },
      { href: "/dining/casual-dining", label: "Casual Dining" },
      { href: "/dining/quick-bites", label: "Quick Bites" },
      { href: "/dining/late-night", label: "Late Night" },
      { href: "/dining/romantic", label: "Romantic" },
      { href: "/dining/family-friendly", label: "Family-Friendly" },
    ],
    [],
  );

  // Cuisine submenu items - all 19 cuisine types
  const cuisineItems = useMemo<NavLink[]>(
    () => [
      { href: "/cuisine/japanese", label: "Japanese" },
      { href: "/cuisine/korean", label: "Korean" },
      { href: "/cuisine/chinese", label: "Chinese" },
      { href: "/cuisine/thai", label: "Thai" },
      { href: "/cuisine/vietnamese", label: "Vietnamese" },
      { href: "/cuisine/indian", label: "Indian" },
      { href: "/cuisine/western", label: "Western" },
      { href: "/cuisine/italian", label: "Italian" },
      { href: "/cuisine/american", label: "American" },
      { href: "/cuisine/mexican", label: "Mexican" },
      { href: "/cuisine/mediterranean", label: "Mediterranean" },
      { href: "/cuisine/european", label: "European" },
      { href: "/cuisine/local", label: "Local" },
      { href: "/cuisine/seafood", label: "Seafood" },
      { href: "/cuisine/fast-food", label: "Fast Food" },
      { href: "/cuisine/cafe", label: "Cafe" },
      { href: "/cuisine/dessert", label: "Dessert" },
      { href: "/cuisine/bubble-tea", label: "Bubble Tea" },
      { href: "/cuisine/food-court", label: "Food Court" },
    ],
    [],
  );

  // Discover menu items with nested shopping malls, cuisines, and dining options
  const discoverItems = useMemo(
    () => [
      {
        href: "/shopping-malls",
        label: "Shopping Malls",
        items: shoppingMallItems,
      },
      {
        href: "/cuisine/all",
        label: "Cuisines",
        items: cuisineItems,
      },
      {
        href: "/dining",
        label: "Dining Options",
        items: diningItems,
      },
      { href: "/deals", label: "Latest Deals" },
      { href: "/category/recipe", label: "Recipes" },
      { href: "/postal-code-food-finder", label: "Find Food Near Me" },
    ],
    [shoppingMallItems, cuisineItems, diningItems],
  );

  // Flat discover list for mobile nav
  const discover = useMemo<NavLink[]>(
    () => [
      { href: "/shopping-malls", label: "Shopping Malls" },
      { href: "/cuisine/all", label: "Cuisines" },
      { href: "/dining", label: "Dining Options" },
      { href: "/deals", label: "Latest Deals" },
      { href: "/category/recipe", label: "Recipes" },
      { href: "/postal-code-food-finder", label: "Find Food Near Me" },
    ],
    [],
  );

  const about = useMemo<NavLink[]>(
    () => [
      { href: "/about", label: "About Us" },
      { href: "/our-story", label: "Our Story" },
      { href: "/contact-us", label: "Contact Us" },
      { href: "/advertise", label: "Advertise With Us" },
    ],
    [],
  );

  const blog = useMemo<NavLink[]>(
    () => [
      { href: "/blog", label: "Blog" },
      { href: "/food-guides", label: "Food Guides" },
      { href: "/dining-guides", label: "Dining Guides" },
      { href: "/recipes", label: "Recipes" },
    ],
    [],
  );

  const mobileSections = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Discover", items: discover },
      { label: "About Us", href: "/about", items: about },
      { label: "Blog", href: "/blog", items: blog },
      { label: "Partnership", href: "/partnership" },
      { label: "Careers", href: "/careers" },
    ],
    [about, blog, discover],
  );

  const isActiveHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="border-b border-gray-100">
        <div className="container">
          <div className="hidden md:grid h-16 grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex items-center gap-4 text-gray-900">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 hover:text-bfw-red transition-colors"
              >
                <IconFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 hover:text-bfw-red transition-colors"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.pinterest.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="p-2 hover:text-bfw-red transition-colors"
              >
                <IconPinterest className="h-4 w-4" />
              </a>
            </div>

            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/brand/logo.svg"
                alt="BestFoodWhere"
                width={200}
                height={44}
                priority
                style={{ height: "auto" }}
              />
            </Link>

            <div className="flex items-center justify-end gap-3 text-gray-900">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Search"
              >
                <IconSearch className="h-5 w-5" />
              </button>
              <Link
                href="/login"
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Account"
              >
                <IconUser className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="flex h-16 items-center md:hidden">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 items-center justify-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/brand/logo.svg"
                  alt="BestFoodWhere"
                  width={170}
                  height={40}
                  priority
                  style={{ height: "auto" }}
                />
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Search"
              >
                <IconSearch className="h-5 w-5" />
              </button>
              <Link
                href="/login"
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Account"
              >
                <IconUser className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-b border-gray-100">
        <div className="container">
          <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
            <div />

            <nav className="flex items-center justify-center">
              <Link
                href="/"
                className={`relative px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors ${
                  isActiveHome
                    ? "before:absolute before:left-4 before:right-4 before:-top-[1px] before:h-[2px] before:bg-bfw-red after:absolute after:left-4 after:right-4 after:-bottom-[1px] after:h-[2px] after:bg-bfw-red"
                    : ""
                }`}
              >
                Home
              </Link>
              <NestedNavDropdown label="Discover" items={discoverItems} />
              <NavDropdown label="About Us" items={about} />
              <NavDropdown label="Blog" items={blog} />
              <Link
                href="/partnership"
                className="px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors"
              >
                Partnership
              </Link>
              <Link
                href="/careers"
                className="px-4 py-3 text-[15px] font-medium text-gray-900 hover:text-bfw-red transition-colors"
              >
                Careers
              </Link>
            </nav>

            <div className="flex justify-end">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-bfw-red px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#d32f2f] transition-colors"
              >
                <IconPin className="h-4 w-4" />
                List Your Restaurant
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sections={mobileSections}
        ctaHref={ctaHref}
      />
    </header>
  );
}
