# n8n Workflows for BestFoodWhere

## Restaurant Image Processing

### Overview

These workflows automate the processing, optimization, and storage of restaurant images from Google Sheets to Supabase Storage CDN.

### Workflows

#### 1. Restaurant Image Processor (`restaurant-image-processor.json`)

**Purpose:** Batch process all restaurant images from Google Sheets

**Triggers:**

- Manual trigger (for on-demand processing)
- Daily schedule (24-hour interval)

**Flow:**

1. Fetch restaurant data from Google Sheets
2. Parse restaurant info (name, image URL, mall)
3. Download each image
4. Validate image (check size, format)
5. Upload to Supabase Storage (`restaurant-images` bucket)
6. Update `restaurant_image_cache` table with CDN URLs

**Required Credentials:**

- Google Sheets OAuth2
- Supabase API

**Environment Variables:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

#### 2. Image Upscaler (`image-upscaler.json`)

**Purpose:** On-demand AI upscaling for low-quality images

**Trigger:** Webhook POST to `/webhook/bfw-upscale-image`

**Request Body:**

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "mallSlug": "suntec-city",
  "restaurantSlug": "restaurant-name"
}
```

**Flow:**

1. Download original image
2. Send to Replicate API (Real-ESRGAN model)
3. Wait for processing
4. Download upscaled image
5. Upload to Supabase Storage
6. Return CDN URL

**Required Credentials:**

- Replicate API Token

**Environment Variables:**

- `REPLICATE_API_TOKEN` - Replicate API token
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Setup Instructions

1. **Import Workflows:**
   - Open n8n dashboard
   - Go to Workflows → Import from File
   - Select the JSON files from this folder

2. **Configure Credentials:**
   - Google Sheets: OAuth2 connection to your Google account
   - Supabase: API key from your Supabase project
   - Replicate (optional): API token from replicate.com

3. **Set Environment Variables:**

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   REPLICATE_API_TOKEN=your-replicate-token (optional)
   ```

4. **Activate Workflows:**
   - Enable the workflows in n8n
   - Test with manual trigger first

### Storage Structure

Images are stored in Supabase Storage with this path structure:

```
restaurant-images/
├── suntec-city/
│   ├── restaurant-slug-1/
│   │   └── restaurant-slug-1.jpg
│   └── restaurant-slug-2/
│       └── restaurant-slug-2.webp
├── vivocity/
│   └── ...
```

### API Endpoints

The Next.js app provides these endpoints for image management:

- `POST /api/images/process` - Process single image
- `PUT /api/images/process` - Batch process multiple images

### Cache Table

The `restaurant_image_cache` table stores:

- `original_url` - Original image URL from Google Sheets
- `cdn_url` - Supabase Storage CDN URL
- `mall_slug` - Mall identifier
- `restaurant_slug` - Restaurant identifier
- `file_size` - Image file size in bytes
- `processed_at` - Processing timestamp

### Troubleshooting

**Images not processing:**

- Check Google Sheets API credentials
- Verify spreadsheet is accessible
- Check n8n execution logs

**Upload failures:**

- Verify Supabase Storage bucket exists
- Check RLS policies allow uploads
- Confirm service role key is correct

**Upscaling not working:**

- Verify Replicate API token
- Check if model version is still available
- Monitor Replicate usage limits
