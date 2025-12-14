-- Revert: Rename classic-scroll layout back to royal-elegance

-- Step 1: Revert the default value in invitations table
ALTER TABLE "invitations" 
ALTER COLUMN "layout_id" SET DEFAULT 'royal-elegance';

-- Step 2: Revert existing invitations that use 'classic-scroll' to 'royal-elegance'
UPDATE "invitations"
SET "layout_id" = 'royal-elegance'
WHERE "layout_id" = 'classic-scroll';

-- Step 3: Revert the layout record in layouts table
UPDATE "layouts"
SET 
  "id" = 'royal-elegance',
  "name" = 'Royal Elegance',
  "description" = 'The live Priya & Saurabh invitation with classic gold flourishes, soft blush gradients, and traditional detailing.',
  "preview_image" = '/templates/royal-elegance/preview.jpg',
  "config" = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          "config",
          '{id}',
          '"royal-elegance"'
        ),
        '{name}',
        '"Royal Elegance"'
      ),
      '{metadata,previewImage}',
      '"/templates/royal-elegance/preview.jpg"'
    ),
    '{metadata,description}',
    '"Live Priya & Saurabh invitation — classic gold with blush gradients and traditional detailing."'
  ),
  "manifest" = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            "manifest",
            '{id}',
            '"royal-elegance"'
          ),
          '{name}',
          '"Royal Elegance"'
        ),
        '{description}',
        '"The live Priya & Saurabh invitation with classic gold flourishes, soft blush gradients, and traditional detailing."'
      ),
      '{previewImage}',
      '"/templates/royal-elegance/preview.jpg"'
    ),
    '{previewImages}',
    '["/templates/royal-elegance/preview-1.jpg", "/templates/royal-elegance/preview-2.jpg"]'::jsonb
  )
WHERE "id" = 'classic-scroll';
