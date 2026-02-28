---
name: bfw-component-generator
description: Generate BestFoodWhere components following project patterns. Use when creating new sections, cards, forms, or page templates for BFW.
---

# BFW Component Generator

When creating components for BestFoodWhere, follow these patterns:

## File Locations

| Type | Path |
|------|------|
| Page sections | `/components/sections/` |
| Cards | `/components/cards/` |
| Layout elements | `/components/layout/` |
| Templates | `/components/templates/` |
| Pages | `/app/[route]/page.tsx` |

## Component Structure

```tsx
"use client"; // Only if using hooks, state, or event handlers

import { useState } from "react"; // Only needed imports
import { IconName } from "@/components/layout/icons";

interface ComponentNameProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export function ComponentName({ title, description, onAction }: ComponentNameProps) {
  return (
    <section className="...">
      {/* Content */}
    </section>
  );
}
```

## Design Tokens (from globals.css)

### Colors
```css
/* Navy palette */
--bfw-navy-dark: #1d2b44;
--bfw-navy-medium: #0f2b52;
--bfw-navy-light: #12335f;

/* Orange (brand) */
--bfw-orange: #ef5f2a;      /* Use: bg-bfw-orange */
--bfw-orange-hover: #d94f1a;

/* Text colors */
text-white              /* On dark backgrounds */
text-white/80           /* Secondary on dark */
text-white/60           /* Muted on dark */
text-white/40           /* Very muted on dark */
text-[#1d2b44]          /* Primary on light */
text-[#667085]          /* Muted on light */
```

### Glassmorphism Pattern
```tsx
<div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
  {/* Glassmorphic card content */}
</div>
```

### Typography
```tsx
/* Headings */
<h1 className="font-heading text-4xl font-bold md:text-5xl">
<h2 className="font-heading text-2xl font-semibold md:text-3xl">
<h3 className="font-heading text-xl font-semibold">

/* Body text */
<p className="font-body text-base">
<p className="font-body text-sm text-[#667085]">
```

## Responsive Pattern (Mobile-First)

```tsx
<div className="
  px-4 py-8           /* Mobile */
  md:px-8 md:py-12    /* Tablet */
  lg:px-12 lg:py-16   /* Desktop */
">
```

## Common Layouts

### Section Container
```tsx
<section className="bg-[#1d2b44] py-16">
  <div className="mx-auto max-w-[1200px] px-4">
    {/* Section content */}
  </div>
</section>
```

### Grid Layouts
```tsx
/* 2-4 column responsive grid */
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

/* Split layout */
<div className="grid items-center gap-8 lg:grid-cols-2">
```

### Card Pattern
```tsx
<div className="rounded-2xl border border-[#eef0f4] bg-white p-6 shadow-sm transition hover:shadow-md">
  <div className="mb-4 h-12 w-12 rounded-xl bg-[#203a63]">
    {/* Icon */}
  </div>
  <h3 className="font-heading text-lg font-semibold text-[#1d2b44]">
    Title
  </h3>
  <p className="mt-2 font-body text-sm text-[#667085]">
    Description
  </p>
</div>
```

## Form Pattern (Multi-Step)

```tsx
const [step, setStep] = useState(1);
const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
const [form, setForm] = useState({ name: "", email: "", phone: "" });

// Step indicators
<div className="flex items-center gap-3">
  {[1, 2, 3].map((s) => (
    <div
      key={s}
      className={`flex h-10 w-10 items-center justify-center rounded-full font-heading text-sm font-semibold ${
        s === step
          ? "bg-bfw-orange text-white shadow-[0_0_20px_rgba(239,95,42,0.4)]"
          : s < step
          ? "bg-green-500 text-white"
          : "bg-white/10 text-white/40"
      }`}
    >
      {s < step ? "✓" : s}
    </div>
  ))}
</div>
```

## Button Styles

```tsx
/* Primary */
<button className="rounded-xl bg-bfw-orange px-6 py-3 font-heading text-base font-semibold text-white transition hover:bg-bfw-orange-hover">

/* Secondary */
<button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-heading text-sm font-medium text-white/70 transition hover:bg-white/10">

/* Ghost */
<button className="font-body text-sm text-bfw-orange hover:underline">
```

## Input Styles

```tsx
<input
  className="h-12 w-full rounded-xl border border-[#e5e8ee] bg-white pl-12 pr-4 font-body text-base text-[#101828] outline-none transition focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/15"
  placeholder="Enter value"
/>

/* On dark backgrounds */
<input
  className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 font-body text-base text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-bfw-orange focus:bg-white/10"
/>
```

## Icons Import

```tsx
import {
  IconMail,
  IconPhone,
  IconUsers,
  IconX,
  IconChevronRight,
  IconFacebook,
  IconInstagram,
  IconPinterest,
} from "@/components/layout/icons";

// Usage
<IconMail className="h-5 w-5 text-bfw-orange" />
```

## Animation Classes

```css
/* Float animation (in globals.css) */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Pulse for indicators */
<span className="h-2 w-2 animate-pulse rounded-full bg-bfw-orange" />
```

## Tag/Badge Pattern

```tsx
/* Pill badge */
<span className="rounded-full bg-bfw-orange/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bfw-orange">
  Limited Spots
</span>

/* Highlight text */
<span className="bg-[#ffe066] px-2 text-[#1d2b44]">
  Highlighted Text
</span>
```
