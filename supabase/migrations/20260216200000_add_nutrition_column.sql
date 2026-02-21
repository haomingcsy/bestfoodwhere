ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT NULL;

COMMENT ON COLUMN menu_items.nutrition IS 'AI-estimated nutrition facts: {calories, protein, carbs, fat, sodium, sugar, fiber, allergens[], healthBenefits[]}';
