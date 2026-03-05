---
globs:
  - "data/**"
  - "lib/google-sheets.ts"
  - "lib/shopping-mall-sheets.ts"
---

# Data Sources & Legacy Rules

## CRITICAL: Large Files

- **NEVER read cuisine data files fully** — `data/cuisines/chinese.ts` is 60K+ lines. Always use Grep or Read with offset/limit params.

## Google Sheets (Legacy)

- `lib/google-sheets.ts` — Uses `GOOGLE_SHEETS_SPREADSHEET_ID` env var
- Assessment/Menu spreadsheet (`1_cYc7...`): Has "Assessment" sheet with restaurant-centric data
- Sheet auto-detection: prefers "Assessment" sheet, then any sheet with "menu" in name, then first sheet

## Shopping Mall Sheets

- `lib/shopping-mall-sheets.ts` — Has a **HARDCODED** spreadsheet ID (not env var)
- **NEVER modify the spreadsheet ID** without verifying sheet format — IDs were swapped once during initial setup
- Mall-organized spreadsheet (`198QKX...`): Has "Full info", "URLs", "Part 1/2", "Menu" sheets

## Data Migration Status

- Primary data source is being migrated from Google Sheets → Supabase
- Brand/location data: already in Supabase (`brands`, `brand_locations` tables)
- Mall data: partially in Supabase (`mall_restaurants`), partially in Sheets
- Menu data: `MENU_DATA_SOURCE` env var controls source (supabase vs sheets)
