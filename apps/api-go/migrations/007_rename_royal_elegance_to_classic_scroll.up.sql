-- Rename royal-elegance layout to classic-scroll
-- This migration renames the layout ID from 'royal-elegance' to 'classic-scroll'
-- to better reflect the layout's design pattern (classic single-column vertical scroll)

-- Step 1: Update the default value in invitations table
ALTER TABLE "invitations" 
ALTER COLUMN "layout_id" SET DEFAULT 'classic-scroll';

-- Step 2: Update existing invitations that use 'royal-elegance' to 'classic-scroll'
UPDATE "invitations"
SET "layout_id" = 'classic-scroll'
WHERE "layout_id" = 'royal-elegance';

-- Step 3: Update the layout record in layouts table
-- Update the layout ID, name, description, and all image paths
UPDATE "layouts"
SET 
  "id" = 'classic-scroll',
  "name" = 'Classic Scroll',
  "description" = 'Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings.',
  "preview_image" = '/templates/classic-scroll/preview.jpg',
  "config" = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          "config",
          '{id}',
          '"classic-scroll"'
        ),
        '{name}',
        '"Classic Scroll"'
      ),
      '{metadata,previewImage}',
      '"/templates/classic-scroll/preview.jpg"'
    ),
    '{metadata,description}',
    '"Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings."'
  ),
  "manifest" = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            "manifest",
            '{id}',
            '"classic-scroll"'
          ),
          '{name}',
          '"Classic Scroll"'
        ),
        '{description}',
        '"Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings."'
      ),
      '{previewImage}',
      '"/templates/classic-scroll/preview.jpg"'
    ),
    '{previewImages}',
    '["/templates/classic-scroll/preview-1.jpg", "/templates/classic-scroll/preview-2.jpg"]'::jsonb
  )
WHERE "id" = 'royal-elegance';
