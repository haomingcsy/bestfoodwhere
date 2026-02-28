# Recipe Generator Skill

Generate comprehensive, high-quality recipe content by researching multiple online sources and synthesizing unique content.

## Trigger

- `/recipe-generator "Recipe Name"` - Generate content for a recipe by name
- `/recipe-generator wp:slug-name` - Generate content for a WordPress post by slug

## Workflow

### Step 1: Research Phase

Search for 3-5 top recipe sources:

```
WebSearch: "{recipe_name} recipe"
```

**Prioritize reputable food sites:**

- SeriousEats (for technique)
- AllRecipes (for home cook validation)
- BonAppetit / Epicurious (for refined versions)
- RecipeTinEats / Budget Bytes (for practical tips)
- Food Network / NYT Cooking (for professional standards)

### Step 2: Content Extraction

For each source, use WebFetch to extract:

- Complete ingredient list with measurements
- Step-by-step instructions
- Prep and cook times
- Tips, notes, and variations
- User comments/reviews for common issues

### Step 3: Synthesis

Analyze all sources and create synthesized content:

**Ingredients:**

- Cross-reference quantities across sources
- Resolve conflicts (use most common or average)
- Normalize units (prefer metric with imperial conversion)
- Group by section if applicable (sauce, main, garnish)

**Instructions:**

- Merge best practices from each source
- Include timing per step where helpful
- Add tips inline where relevant
- Ensure logical flow

**Times:**

- Calculate average prep/cook times from sources
- Add 10% buffer for home cooks
- Validate times make sense for the dish

**Additional Content:**

- Pro tips (deduplicated from all sources)
- Common mistakes (from reviews/comments)
- Doneness indicators
- Storage instructions
- Substitutions for common ingredients

**FAQ:**

- Generate from common questions in reviews
- Include substitution questions
- Address dietary modifications

### Step 4: Store in Supabase

Insert the synthesized content into the `recipe_content` table:

```typescript
const supabase = getSupabaseServerClient();

await supabase.from("recipe_content").upsert({
  wp_slug: slug,
  title: title,
  description: description,
  introduction: introduction,
  why_love_it: whyLoveIt,
  prep_time_minutes: prepTime,
  cook_time_minutes: cookTime,
  servings: servings,
  difficulty: difficulty,
  ingredients: ingredients,
  instructions: instructions,
  equipment: equipment,
  substitutions: substitutions,
  nutrition: nutrition,
  doneness_tips: donenessTips,
  storage_tips: storageTips,
  pro_tips: proTips,
  common_mistakes: commonMistakes,
  faq: faq,
  sources: sources,
  generated_at: new Date().toISOString(),
});
```

## Output Format

Return a summary showing:

- Recipe title
- Quick facts (times, servings, difficulty)
- Number of ingredients
- Number of steps
- Sources used
- Storage confirmation

## Quality Standards

### Ingredients

- 8-20 items with precise measurements
- Include ALL necessary ingredients (don't assume)
- Specify sizes (e.g., "large onion", "medium carrot")
- Include optional garnishes

### Instructions

- 5-15 clear, actionable steps
- Each step should be completable (not too long)
- Include temperatures in both F and C
- Mention visual/sensory cues

### Times

- Prep: Active hands-on time
- Cook: Time food is cooking/resting
- Validated against 3+ sources

### Content Guidelines

- NEVER copy text verbatim - always rewrite
- Cite sources for attribution
- Write in friendly, encouraging tone
- Include practical tips a home cook would need
- Address common mistakes proactively

## Example Output

```
Recipe Generated: Aglio Olio (Garlic Oil Pasta)

Quick Facts:
- Prep: 10 mins | Cook: 15 mins | Total: 25 mins
- Servings: 4 | Difficulty: Easy

Content Generated:
- 9 ingredients across 1 section
- 8 instruction steps
- 4 pro tips
- 3 FAQ items
- 5 sources cited

Stored in Supabase: recipe_content (wp_slug: garlic-oil-pasta)

Sources:
1. SeriousEats - The Best Spaghetti Aglio e Olio
2. BonAppetit - Midnight Pasta
3. RecipeTinEats - Spaghetti Aglio Olio
4. AllRecipes - Pasta Aglio e Olio
5. NYT Cooking - Spaghetti With Garlic and Oil
```

## Environment Requirements

- Supabase service role key (for writes)
- WebSearch and WebFetch tools available

## Error Handling

- If < 3 sources found, warn user and proceed with available
- If Supabase write fails, output JSON to console for manual entry
- If ingredients conflict significantly, flag for manual review
