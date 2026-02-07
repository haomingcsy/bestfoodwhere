# Recipe Image Generation Guide

## CORRECT PROMPT FORMAT (DO NOT CHANGE)

```
[description of the cooking action], clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram
```

## CRITICAL RULES

1. **NEVER include "WikiHow" in the prompt** - the model will literally write "WikiHow" on the image
2. **NEVER include brand names** - they may appear as text
3. **Always test with 1 image first** before generating a full batch
4. **Store in `image_url` field** (not `image_hint`) to match ginger-chicken

## EXAMPLE PROMPTS

Step 1 - Preparing chicken:

```
hands rubbing salt into whole raw chicken on wooden cutting board with ginger pieces nearby, clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram
```

Step 5 - Making sauce:

```
bright orange-red chili sauce in small bowl with mortar and pestle, clean line art illustration, soft pastel watercolor style, minimalist cooking scene, no text, no labels, no numbers, no words, no letters, no watermarks, light cream background, simple instructional diagram
```

## REFERENCE: ginger-chicken (working example)

Images stored at: `recipe-images/ginger-chicken-v2/step-{n}.png`
Field used: `image_url` (not `image_hint`)

## BFL API SETTINGS

- Endpoint: `https://api.bfl.ml/v1/flux-pro-1.1-ultra`
- Width: 1024
- Height: 768
- Safety tolerance: 2
