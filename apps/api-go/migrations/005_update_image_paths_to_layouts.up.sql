-- Update image paths in JSON data from /templates/ to /layouts/
-- This migration updates the previewImage paths in both the preview_image column
-- and within the JSONB config and manifest columns

-- Update preview_image column
UPDATE templates 
SET preview_image = REPLACE(preview_image, '/templates/', '/layouts/')
WHERE preview_image LIKE '/templates/%';

-- Update previewImage in config JSONB
UPDATE templates
SET config = jsonb_set(
  config,
  '{metadata,previewImage}',
  to_jsonb(REPLACE(config->'metadata'->>'previewImage', '/templates/', '/layouts/'))
)
WHERE config->'metadata'->>'previewImage' LIKE '/templates/%';

-- Update previewImage in manifest JSONB
UPDATE templates
SET manifest = jsonb_set(
  manifest,
  '{previewImage}',
  to_jsonb(REPLACE(manifest->>'previewImage', '/templates/', '/layouts/'))
)
WHERE manifest->>'previewImage' LIKE '/templates/%';

-- Update previewImage in nested manifest locations (if exists)
UPDATE templates
SET manifest = jsonb_set(
  manifest,
  '{metadata,previewImage}',
  to_jsonb(REPLACE(manifest->'metadata'->>'previewImage', '/templates/', '/layouts/'))
)
WHERE manifest->'metadata'->>'previewImage' LIKE '/templates/%';


