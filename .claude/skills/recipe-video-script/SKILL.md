# Recipe Video Script Generator

Generate AI voiceover scripts for BFW faceless cooking videos.

## Trigger

```
/recipe-video-script "ginger-chicken"
/recipe-video-script "Aglio Olio"
```

## Workflow

1. **Get Recipe Data**
   - Check Supabase `recipe_content` for enriched content
   - If not found, fetch from WordPress and extract key info

2. **Generate Script**
   - Use the standardized template below
   - Keep total duration ~75 seconds
   - Write in conversational, friendly tone

3. **Output**
   - Display formatted script
   - Optionally save to `video_script` column in Supabase

## Script Template

```
---
RECIPE: {recipe_name}
DURATION: 75 seconds
---

[HOOK - 5 sec]
"Want to know the secret to perfect {dish}? Let me show you."

[INGREDIENTS - 10 sec]
"You'll need {ingredient_1}, {ingredient_2}, {ingredient_3},
and a few pantry staples."

[STEP 1 - 10 sec]
"{action_1}. This is key for {reason_1}."

[STEP 2 - 10 sec]
"Next, {action_2}. You'll know it's ready when {visual_cue_2}."

[STEP 3 - 10 sec]
"Now {action_3}. Don't skip this step - it's what makes the difference."

[STEP 4 - 10 sec]
"{action_4}. See how {visual_description}? That's exactly what you want."

[FINAL STEP - 10 sec]
"Finally, {final_action}. And just like that, you're done."

[BEAUTY SHOT - 5 sec]
"Look at that. Restaurant-quality {dish}, made at home."

[CTA - 5 sec]
"Get the full recipe with exact measurements at bestfoodwhere.sg."
```

## Writing Guidelines

### Voice & Tone

- Conversational, like teaching a friend
- Confident but not arrogant
- Encouraging ("you've got this")
- Specific over vague ("golden brown" vs "cooked")

### Script Rules

1. NO timestamps in the spoken script
2. Use contractions (you'll, it's, don't)
3. Include sensory cues (sizzle, aroma, color)
4. One clear action per section
5. End sections with visual cues for editors

### Words to Use

- "Perfect", "Restaurant-quality", "Secret"
- "Here's the trick", "This is key"
- "See how...", "Notice the..."

### Words to Avoid

- "Simple", "Easy", "Basic" (sounds dismissive)
- "Um", "Uh", "So..." (filler words)
- Technical jargon without explanation

## Example Output

For "ginger-chicken":

```
---
RECIPE: Zesty Ginger Chicken
DURATION: 75 seconds
---

[HOOK]
"Want restaurant-quality ginger chicken at home? Here's the secret."

[INGREDIENTS]
"You'll need chicken thighs, fresh ginger, garlic, soy sauce,
and a splash of Shaoxing wine."

[STEP 1]
"First, smash your ginger and garlic. This releases all those
aromatic oils - smell that?"

[STEP 2]
"Get your wok smoking hot, then sear the chicken. Don't touch it
for 45 seconds. See that golden crust? Perfect."

[STEP 3]
"Add your aromatics and let them sizzle. That smell means
the flavors are building."

[STEP 4]
"Pour in the sauce, cover, and let it simmer. The liquid should
reduce by half - glossy and thick."

[FINAL]
"Hit it with green onions, thicken with cornstarch, and you're done."

[BEAUTY]
"Look at that glaze. This is what takeout wishes it could be."

[CTA]
"Full recipe at bestfoodwhere.sg. Link below."
```

## Supabase Update

After generating, optionally save:

```sql
UPDATE recipe_content
SET video_script = '[generated script]'
WHERE wp_slug = 'ginger-chicken';
```
