---
name: seo-generator
description: Generate SEO metadata, structured data, and optimize pages for search engines. Use when creating new pages, adding meta tags, or implementing JSON-LD.
---

# SEO Generator for BestFoodWhere

When optimizing pages for SEO, follow these patterns:

## Next.js App Router Metadata

### Static Metadata (Preferred)
```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | BestFoodWhere Singapore",
  description: "150-160 character description with primary keywords. Be specific about what users will find on this page.",
  keywords: ["singapore food", "restaurant", "specific keyword"],
  openGraph: {
    title: "Page Title | BestFoodWhere",
    description: "Same or variation of meta description",
    url: "https://bestfoodwhere.sg/page-path",
    siteName: "BestFoodWhere",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Descriptive alt text",
      },
    ],
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Description for Twitter",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://bestfoodwhere.sg/page-path",
  },
};
```

### Dynamic Metadata
```tsx
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchData(params.slug);

  return {
    title: `${data.name} | BestFoodWhere Singapore`,
    description: data.description.slice(0, 160),
    openGraph: {
      title: data.name,
      description: data.description,
      images: [data.image],
    },
  };
}
```

## JSON-LD Structured Data

### Restaurant Schema
```tsx
const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Restaurant Name",
  description: "Brief description",
  image: "https://example.com/image.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Street Name",
    addressLocality: "Singapore",
    postalCode: "123456",
    addressCountry: "SG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  url: "https://bestfoodwhere.sg/restaurant/slug",
  telephone: "+65-1234-5678",
  servesCuisine: ["Chinese", "Singaporean"],
  priceRange: "$$",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "11:00",
      closes: "22:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "123",
  },
};

// Add to page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
/>
```

### Organization Schema (for homepage)
```tsx
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BestFoodWhere",
  url: "https://bestfoodwhere.sg",
  logo: "https://bestfoodwhere.sg/logo.png",
  sameAs: [
    "https://www.facebook.com/bestfoodwhere/",
    "https://www.instagram.com/bestfoodwhere/",
    "https://www.pinterest.com/bestfoodwhere/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@bestfoodwhere.sg",
  },
};
```

### BreadcrumbList Schema
```tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://bestfoodwhere.sg",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Restaurants",
      item: "https://bestfoodwhere.sg/restaurants",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Restaurant Name",
    },
  ],
};
```

### FAQ Schema
```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Question text here?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Answer text here.",
      },
    },
  ],
};
```

## Page Structure Requirements

### Semantic HTML
```tsx
<main>
  <article>
    <header>
      <h1>Primary Keyword in H1</h1>
      <p>Intro paragraph with secondary keywords</p>
    </header>

    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section with Keywords</h2>
      {/* Content */}
    </section>
  </article>

  <aside>
    {/* Related content, sidebar */}
  </aside>
</main>
```

### Heading Hierarchy
```
H1: One per page, primary keyword
├── H2: Section headings, secondary keywords
│   ├── H3: Subsection headings
│   └── H3: Subsection headings
└── H2: Another section
```

### Image Optimization
```tsx
import Image from "next/image";

<Image
  src="/images/dish.jpg"
  alt="Descriptive alt text with keywords - Hainanese Chicken Rice at Restaurant Name"
  width={800}
  height={600}
  loading="lazy"           // or "eager" for above-the-fold
  placeholder="blur"
  blurDataURL="data:..."
/>
```

### Internal Linking
```tsx
// Use descriptive anchor text
<Link href="/cuisine/chinese">Chinese restaurants in Singapore</Link>

// Not: "Click here" or "Read more"
```

## URL Structure

| Page Type | URL Pattern | Example |
|-----------|-------------|---------|
| Restaurant | `/restaurant/[slug]` | `/restaurant/four-leaves` |
| Cuisine | `/cuisine/[type]` | `/cuisine/chinese` |
| Mall | `/shopping-malls/[slug]` | `/shopping-malls/jewel` |
| Blog | `/blog/[slug]` | `/blog/best-hawker-centers` |

## robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://bestfoodwhere.sg/sitemap.xml
```

## Sitemap Generation
```tsx
// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): MetadataRoute.Sitemap {
  const restaurants = await getRestaurants();

  return [
    {
      url: "https://bestfoodwhere.sg",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...restaurants.map((r) => ({
      url: `https://bestfoodwhere.sg/restaurant/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

## Performance Checklist

- [ ] Core Web Vitals optimized (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Images optimized with next/image
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] JavaScript deferred where possible
- [ ] Server-side rendering for main content
