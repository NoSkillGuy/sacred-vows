-- Revert: Update image paths in JSON data from /layouts/ back to /templates/

-- Update preview_image column
UPDATE templates 
SET preview_image = REPLACE(preview_image, '/layouts/', '/templates/')
WHERE preview_image LIKE '/layouts/%';

-- Update previewImage in config JSONB
UPDATE templates
SET config = jsonb_set(
  config,
  '{metadata,previewImage}',
  to_jsonb(REPLACE(config->'metadata'->>'previewImage', '/layouts/', '/templates/'))
)
WHERE config->'metadata'->>'previewImage' LIKE '/layouts/%';

-- Update previewImage in manifest JSONB
UPDATE templates
SET manifest = jsonb_set(
  manifest,
  '{previewImage}',
  to_jsonb(REPLACE(manifest->>'previewImage', '/layouts/', '/templates/'))
)
WHERE manifest->>'previewImage' LIKE '/layouts/%';

-- Update previewImage in nested manifest locations (if exists)
UPDATE templates
SET manifest = jsonb_set(
  manifest,
  '{metadata,previewImage}',
  to_jsonb(REPLACE(manifest->'metadata'->>'previewImage', '/layouts/', '/templates/'))
)
WHERE manifest->'metadata'->>'previewImage' LIKE '/layouts/%';


