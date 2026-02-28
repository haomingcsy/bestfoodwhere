-- Recipe Scheduling Migration
-- Adds publish_status and scheduled_date fields for scheduled publishing

-- Create enum type for publish status
CREATE TYPE recipe_publish_status AS ENUM ('draft', 'scheduled', 'published');

-- Add new columns to recipe_content table
ALTER TABLE recipe_content
ADD COLUMN publish_status recipe_publish_status DEFAULT 'draft',
ADD COLUMN scheduled_date TIMESTAMPTZ;

-- Set existing records to 'published' status (they're already live)
UPDATE recipe_content SET publish_status = 'published';

-- Create index for efficient querying of scheduled recipes
CREATE INDEX idx_recipe_content_publish_status ON recipe_content(publish_status);
CREATE INDEX idx_recipe_content_scheduled_date ON recipe_content(scheduled_date);

-- Composite index for the publish cron query
CREATE INDEX idx_recipe_content_scheduling ON recipe_content(publish_status, scheduled_date)
WHERE publish_status = 'scheduled';

-- Comments for documentation
COMMENT ON COLUMN recipe_content.publish_status IS 'Publishing status: draft (not ready), scheduled (ready with future date), published (visible)';
COMMENT ON COLUMN recipe_content.scheduled_date IS 'Date and time when the recipe should be published (for scheduled status)';
