---
name: marketing-hub-integration
description: Build webhook integrations, email templates, and lead capture forms for marketing-hub. Use when creating newsletter signups, contact forms, email campaigns, or webhook endpoints.
---

# Marketing-Hub Integration Patterns

When building marketing-hub integrations, follow these patterns:

## Webhook Endpoint

All form submissions POST to:
```
https://marketing-hub-cyan.vercel.app/api/v1/webhook/newsletter
```

## Required Payload Structure

```typescript
interface MarketingHubPayload {
  // Required
  email: string;           // Lowercased, trimmed
  name: string;            // Trimmed

  // Source identification
  source: string;          // e.g., "bfw_website", "bfw_vip_club", "contact_form"
  tags: string[];          // e.g., ["newsletter", "vip", "contact_form"]
  workspace_slug: string;  // e.g., "bestfoodwhere"

  // Optional
  phone?: string;          // Singapore format
  subject?: string;        // For contact forms
  message?: string;        // For contact forms

  // Email triggers
  send_welcome?: boolean;      // For newsletter signups
  send_confirmation?: boolean; // For contact forms

  // UTM tracking (always include)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  page_url?: string;
}
```

## Form States Pattern

Always implement these states:
```typescript
type FormStatus = "idle" | "submitting" | "success" | "error";

const [status, setStatus] = useState<FormStatus>("idle");
const [error, setError] = useState<string | null>(null);
```

## Validation Patterns

```typescript
// Email validation
if (!form.email.includes("@")) {
  setError("Please enter a valid email address.");
  return;
}

// Singapore phone validation (if provided)
if (form.phone.trim()) {
  const cleanPhone = form.phone.replace(/[\s\-()]/g, "");
  const sgPhoneRegex = /^(\+65)?[689]\d{7}$/;
  if (!sgPhoneRegex.test(cleanPhone)) {
    setError("Please enter a valid Singapore phone number.");
    return;
  }
}
```

## UTM Capture Pattern

```typescript
const getUTMParams = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    page_url: window.location.href,
  };
};
```

## Traffic Channel Detection

```typescript
const detectTrafficChannel = (utmSource: string, utmMedium: string): string => {
  const source = utmSource.toLowerCase();
  const medium = utmMedium.toLowerCase();

  if (source.includes("chatgpt")) return "ChatGPT";
  if (source.includes("facebook") || source.includes("fb")) return "Meta/Facebook";
  if (source.includes("instagram") || source.includes("ig")) return "Instagram";
  if (source.includes("linkedin")) return "LinkedIn";
  if (source.includes("tiktok")) return "TikTok";
  if (source === "google" && medium === "cpc") return "Google Ads";
  if (source === "google") return "Google SEO";
  return "Direct/Other";
};
```

## Complete Submit Handler Example

```typescript
const submit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError(null);
  setStatus("submitting");

  try {
    const response = await fetch(
      "https://marketing-hub-cyan.vercel.app/api/v1/webhook/newsletter",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          phone: form.phone?.trim(),
          source: "bfw_website",
          tags: ["newsletter", "vip"],
          workspace_slug: "bestfoodwhere",
          send_welcome: true,
          ...getUTMParams(),
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      setStatus("success");
      setForm({ name: "", email: "", phone: "" });
    } else {
      setError(result.error || "Something went wrong.");
      setStatus("idle");
    }
  } catch {
    setStatus("error");
    setError("Something went wrong. Please try again.");
  }
};
```

## Workspace Slugs Reference

| Brand | Workspace Slug |
|-------|---------------|
| BestFoodWhere | `bestfoodwhere` |
| Add more as needed | `slug-here` |
