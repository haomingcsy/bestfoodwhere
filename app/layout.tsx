import type { Metadata } from "next";
import { Montserrat, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  JsonLd,
} from "@/lib/seo/structured-data";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bestfoodwhere.sg"),
  title: {
    default: "Best Food Near You | Discover Singapore's #1 Food Directory",
    template: "%s | BestFoodWhere.sg",
  },
  description:
    "Find the best restaurants, cafes, and food spots in Singapore shopping malls. Browse menus, reviews, opening hours, and exclusive deals at BestFoodWhere.",
  keywords: [
    "Singapore food",
    "restaurant directory",
    "shopping mall food",
    "Singapore restaurants",
    "food near me",
    "best restaurants Singapore",
    "mall dining",
    "Singapore food guide",
  ],
  authors: [{ name: "BestFoodWhere Team" }],
  creator: "BestFoodWhere",
  publisher: "BestFoodWhere",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: "https://bestfoodwhere.sg",
    siteName: "BestFoodWhere",
    title: "Best Food Near You | Discover Singapore's #1 Food Directory",
    description:
      "Find the best restaurants, cafes, and food spots in Singapore shopping malls. Browse menus, reviews, opening hours, and exclusive deals.",
    images: [
      {
        url: "https://bestfoodwhere.sg/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "BestFoodWhere - Singapore Food Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Food Near You | Discover Singapore's #1 Food Directory",
    description:
      "Find the best restaurants, cafes, and food spots in Singapore shopping malls.",
    images: ["https://bestfoodwhere.sg/og/default.jpg"],
    creator: "@bestfoodwhere",
    site: "@bestfoodwhere",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://bestfoodwhere.sg",
  },
  category: "food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate site-wide structured data
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" className={`${montserrat.variable} ${atkinson.variable}`}>
      <head>
        {/* Structured Data for SEO - Site-wide schemas */}
        <JsonLd data={websiteSchema} />
        <JsonLd data={organizationSchema} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <NewsletterSignup />
      </body>
    </html>
  );
}
