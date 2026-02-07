# BFW Recipe Video Production Workflow

## Overview

Faceless cooking videos with AI voiceover. Consistent style across all recipes.

---

## Video Structure (60-90 seconds)

```
[0:00-0:05]  HOOK         - "Here's how to make perfect [dish]"
[0:05-0:15]  INGREDIENTS  - Quick cuts of each ingredient
[0:15-0:60]  COOKING      - Step-by-step hands cooking
[0:60-0:75]  PLATING      - Final assembly and beauty shot
[0:75-0:90]  CTA          - "Find the full recipe at bestfoodwhere.sg"
```

---

## Tools Required

### 1. AI Voice (Pick ONE for consistency)

**Recommended: ElevenLabs** ($5-22/mo)

- Voice: Choose a warm, friendly voice (e.g., "Rachel" or "Josh")
- Settings: Stability 0.5, Clarity 0.75
- Keep SAME voice for ALL recipes

Alternative: Play.ht, WellSaid Labs

### 2. Stock Footage Sources

| Source              | Price  | Best For              |
| ------------------- | ------ | --------------------- |
| **Pexels**          | Free   | General cooking shots |
| **Artgrid**         | $25/mo | Premium quality       |
| **Storyblocks**     | $15/mo | Large library         |
| **Envato Elements** | $16/mo | Variety               |

### 3. Video Editing

- **CapCut** (Free) - Quick edits, good for beginners
- **DaVinci Resolve** (Free) - Professional grade
- **Premiere Pro** ($23/mo) - Industry standard

---

## Script Template

Use this template for EVERY recipe video:

```
---
RECIPE: [Recipe Name]
DURATION: 75 seconds
VOICE: [ElevenLabs voice name]
---

[HOOK - 5 sec]
"Want to know the secret to perfect [dish]? Let me show you."

[INGREDIENTS - 10 sec]
"You'll need [ingredient 1], [ingredient 2], [ingredient 3],
and a few pantry staples."

[STEP 1 - 10 sec]
"Start by [action]. This is key for [reason]."

[STEP 2 - 10 sec]
"Next, [action]. You'll know it's ready when [visual cue]."

[STEP 3 - 10 sec]
"Now [action]. Don't skip this step - it's what makes
the difference."

[STEP 4 - 10 sec]
"[Action]. See how [visual description]? That's exactly
what you want."

[FINAL STEP - 10 sec]
"Finally, [action]. And just like that, you're done."

[BEAUTY SHOT - 5 sec]
"Look at that. Restaurant-quality [dish], made at home."

[CTA - 5 sec]
"Get the full recipe with exact measurements at
bestfoodwhere.sg. Link in the description."
```

---

## Shot List (Stock Footage to Find)

For EACH recipe, source these shots:

### Generic (reusable across recipes)

- [ ] Hands washing vegetables
- [ ] Knife on cutting board (chopping)
- [ ] Oil heating in pan
- [ ] Stirring with wooden spoon
- [ ] Steam rising from pot
- [ ] Plating with tweezers/spoon
- [ ] Final dish beauty shot (overhead)
- [ ] Final dish beauty shot (45-degree angle)

### Recipe-Specific

- [ ] Main protein/ingredient hero shot
- [ ] Key technique (e.g., folding, searing, kneading)
- [ ] Signature moment (sauce reducing, cheese melting, etc.)

---

## Production Checklist

### Pre-Production

- [ ] Write script using template above
- [ ] Generate voiceover in ElevenLabs
- [ ] Source 8-12 stock clips
- [ ] Download recipe thumbnail from WordPress

### Production

- [ ] Import clips to editor
- [ ] Lay down voiceover track
- [ ] Cut clips to match voiceover timing
- [ ] Add transitions (simple cuts or cross-dissolves)
- [ ] Color grade for consistency

### Post-Production

- [ ] Add lower-third text for ingredients
- [ ] Add BFW logo watermark (corner)
- [ ] Add end card with website URL
- [ ] Export: 1080p, 30fps, H.264
- [ ] Create thumbnail (if not using stock)

### Upload

- [ ] Upload to YouTube (unlisted or public)
- [ ] Copy embed URL
- [ ] Update `recipe_content` table with `video_url`

---

## Branding Guidelines

### Visual Style

- **Colors**: Warm, appetizing (avoid blue tones)
- **Text**: Clean sans-serif (Inter, Montserrat)
- **Transitions**: Simple cuts preferred, occasional dissolves
- **Pacing**: Energetic but not rushed

### Audio Style

- **Voice**: Conversational, friendly, confident
- **Music**: Subtle background (optional), upbeat acoustic
- **Sound effects**: Minimal (sizzle, chop sounds OK)

---

## Batch Production Tips

1. **Script 10 recipes at once** before recording
2. **Record all voiceovers** in one session for consistency
3. **Organize footage** by category (proteins, vegetables, techniques)
4. **Create templates** in your editor for faster assembly
5. **Process in batches** of 5 videos at a time

---

## Quality Checklist

Before publishing, verify:

- [ ] Audio levels consistent (-6dB to -3dB peaks)
- [ ] No copyright music/footage
- [ ] Voiceover matches visuals
- [ ] BFW branding visible
- [ ] CTA clear and correct URL
- [ ] Thumbnail is appetizing
- [ ] Video length under 90 seconds

---

## Database Update

After uploading to YouTube:

```sql
UPDATE recipe_content
SET
  video_url = 'https://www.youtube.com/watch?v=VIDEO_ID',
  video_thumbnail = 'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg'
WHERE wp_slug = 'recipe-slug';
```

Or use the admin panel (future feature).
