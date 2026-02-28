---
name: restaurant-researcher
description: Research and collect real data for Singapore restaurants. Fetches factual info from Google Places, scrapes real menus from websites/delivery apps, downloads actual images, and crafts AI descriptions from real facts. Use when populating restaurant data for BFW.
---

# Restaurant Researcher Skill

This skill automates the VA (Virtual Assistant) job of researching restaurants and collecting real, factual data.

## What This Skill Does

1. **Fetches Factual Data** from Google Places API:
   - Rating and review count
   - Opening hours
   - Phone number
   - Website URL
   - Photos

2. **Scrapes Real Menus** from:
   - Restaurant's official website
   - GrabFood listings
   - Foodpanda listings
   - Deliveroo listings

3. **Collects Real Images**:
   - Restaurant photos from Google Places
   - Menu item images from delivery apps
   - Uploads to Supabase Storage / CDN

4. **Generates AI Content** based on real facts:
   - Compelling restaurant description
   - SEO-friendly content
   - BFW recommendation text

## Usage

### Research a Single Restaurant

```
/restaurant-researcher <restaurant_name> at <mall_name>
```

Example:

```
/restaurant-researcher Din Tai Fung at Paragon
```

### Research Multiple Restaurants

```
/restaurant-researcher batch --limit 10
```

This processes restaurants from Supabase that need data.

### Research by Cuisine Type

```
/restaurant-researcher cuisine:Japanese --limit 20
```

## Data Sources Priority

1. **Google Places API** - Primary source for factual info
2. **Official Website** - Menu, about info, images
3. **GrabFood** - Real menu with prices (most reliable)
4. **Foodpanda** - Alternative menu source
5. **Deliveroo** - Additional menu source
6. **Instagram/Facebook** - Social proof, images

## Output

Data is saved to Supabase:

- `mall_restaurants` - Basic info, ratings, hours
- `brand_menus` - Description, social links, promotions
- `menu_categories` - Menu category structure
- `menu_items` - Individual items with real prices
- Supabase Storage - Images (hero, menu items)

## Scripts

The skill uses these supporting scripts:

- `/bfw/scripts/research-restaurant.ts` - Main research logic
- `/bfw/scripts/scrape-grabfood.ts` - GrabFood menu scraper
- `/bfw/scripts/scrape-website-menu.ts` - Website menu extractor
- `/bfw/scripts/sync-google-places.ts` - Google Places data sync

## Workflow

```
1. Input: Restaurant name + location
   ↓
2. Google Places API
   → Rating, reviews, hours, phone, website, photos
   ↓
3. Website/Delivery App Scraping
   → Real menu items with prices
   ↓
4. Image Collection
   → Download and upload to CDN
   ↓
5. AI Content Generation
   → Description, recommendations (based on real facts)
   ↓
6. Save to Supabase
   → All structured data stored
```

## Example Output

For "Din Tai Fung at Paragon":

```json
{
  "name": "Din Tai Fung",
  "location": "Paragon",
  "rating": 4.5,
  "reviewCount": 3847,
  "openingHours": "11:00 AM - 9:30 PM daily",
  "phone": "+65 6836 8336",
  "website": "https://www.dintaifung.com.sg",
  "cuisines": ["Chinese", "Taiwanese", "Dim Sum"],
  "description": "World-renowned Taiwanese restaurant...", // AI-crafted from facts
  "menu": [
    {
      "category": "Signature Dumplings",
      "items": [
        {
          "name": "Xiao Long Bao (10 pcs)",
          "price": "$12.80",
          "description": "Steamed pork dumplings...",
          "imageUrl": "https://cdn.example.com/xlb.jpg"
        }
      ]
    }
  ]
}
```

## Rate Limiting

- Google Places API: 1 request per second
- Website scraping: 2 second delay between requests
- Batch processing: 10 restaurants per batch, 5 minute breaks

## Error Handling

- If Google Places fails → Log and continue with other sources
- If website scraping fails → Try delivery app sources
- If all menu sources fail → Flag for manual entry
- Images always have fallback placeholder
