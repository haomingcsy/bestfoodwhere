---
globs:
  - "app/api/**"
  - "lib/ghl/**"
---

# API Route Rules

## GHL (GoHighLevel) CRM Integration

- **NEVER hardcode GHL field key names** — GHL API requires field **IDs**, not key names. Keys like `bfw_source` won't work. Always use `GHL_FIELD_IDS` mapping from `lib/ghl/utils.ts` → `resolveCustomFieldIds()`.
- GHL API base URL: `https://services.leadconnectorhq.com`, version `2021-07-28`
- Location ID: `aj2VKGwRWaEEQpMnrbNj`
- Custom fields listed via: `GET /locations/{locationId}/customFields` — keys stored with `contact.` prefix

## CRM Routes

- `/api/crm/contacts` — Universal CRM handler (7+ form sources). All forms pass UTM params + `pageUrl` + `bfw_source`.
- `/api/contact` — Contact-us form only (legacy)
- n8n webhooks triggered per form source (see `getWebhookUrl()` in route)

## API Patterns

- All API routes use Next.js App Router route handlers (`route.ts`)
- Error responses: return `NextResponse.json({ error: message }, { status: code })`
- Auth: use `SUPABASE_SERVICE_ROLE_KEY` for server-side DB access, never expose to client
