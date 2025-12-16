-- Update Classic Scroll layout description
-- This migration updates the description for the classic-scroll layout to be more crisp and professional,
-- matching the style of other layouts like Editorial Elegance.

UPDATE "layouts"
SET 
  "description" = 'Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations.',
  "config" = jsonb_set(
    "config",
    '{metadata,description}',
    '"Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations."'
  ),
  "manifest" = jsonb_set(
    "manifest",
    '{description}',
    '"Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations."'
  )
WHERE "id" = 'classic-scroll';

