# Templates Guide

## Folder layout
- Each template lives in `templates/<template-id>/`.
- Required files: `manifest.json` (catalog/landing data), `config.json` (render defaults), `preview.jpg` (thumbnail shown in listings and switchers).
- Optional: additional preview assets (e.g., `preview-2.jpg`) referenced via `manifest.json` `previewImages`.
- Keep asset paths rooted at `/templates/<template-id>/...` so API/builder can serve them directly.

## `manifest.json` (catalog & browsing)
- Purpose: what the API serves to the landing page and builder listings.
- Key fields:
  - `id`, `name`, `version`
  - `description`, `previewImage`, optional `previewImages: []`
  - `tags`: up to 3 strings (API will trim to 3)
  - `category`, `author`
  - Pricing/availability: `price`, `currency`, `status` (`ready`/`coming-soon`/`hidden`), `isAvailable`, `isComingSoon`, `isFeatured`
  - Sections metadata: `sections` array with `{ id, name, description, icon, required, defaultEnabled }`
  - `defaultSectionOrder`: array of section IDs in display order
  - Themes: `themes` array with `{ id, name, isDefault, colors: { primary, secondary, background, text, accent? }, fonts: { heading, body, script } }`
- Notes:
  - `features` is intentionally removed/not used.
  - Tag count is capped to 3; keep them curated.

## `config.json` (render defaults)
- Purpose: defaults the renderer uses when instantiating a template.
- Key fields:
  - `metadata`: `description`, `previewImage`, `tags` (≤3), `author`
  - `sections`: array of `{ id, enabled, config: {} }` for runtime toggles/defaults
  - `theme`: single default theme with `colors` and `fonts` (same shape as a `themes` entry)
- Diff from manifest: config is lean and render-focused; manifest is catalog-facing with pricing, status, and theme choices.

## Minimal example (`art-deco-glam`)
`manifest.json` excerpt:
```json
{
  "id": "art-deco-glam",
  "name": "Art Deco Glam",
  "description": "Black and gold art-deco inspired layout for luxurious celebrations.",
  "previewImage": "/templates/art-deco-glam/preview.jpg",
  "tags": ["luxury", "art-deco", "gold"],
  "category": "luxury",
  "status": "coming-soon",
  "isAvailable": false,
  "sections": [{ "id": "header", "name": "Header", "required": true, "defaultEnabled": true }],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "noir-gold",
      "name": "Noir Gold",
      "isDefault": true,
      "colors": { "primary": "#d4af37", "secondary": "#0f0f10", "background": "#0a0a0c", "text": "#f5e9c9", "accent": "#b88a2d" },
      "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
    }
  ]
}
```

`config.json` excerpt:
```json
{
  "id": "art-deco-glam",
  "metadata": {
    "description": "Black and gold art-deco inspired layout for luxurious celebrations.",
    "previewImage": "/templates/art-deco-glam/preview.jpg",
    "tags": ["luxury", "art-deco", "gold"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} }
  ],
  "theme": {
    "colors": { "primary": "#d4af37", "secondary": "#0f0f10", "background": "#0a0a0c", "text": "#f5e9c9" },
    "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
  }
}
```

## Checklist for adding a template
- Create `templates/<template-id>/` using a URL-safe, lowercase slug.
- Add `manifest.json`, `config.json`, and `preview.jpg` (plus any `preview-*.jpg` referenced in `previewImages`).
- Cap `tags` to 3; ensure `previewImage` paths point to `/templates/<id>/...`.
- Provide at least one theme; mark exactly one `isDefault: true`.
- Keep `sections` IDs consistent across manifest/config; include `defaultSectionOrder` covering all sections.
- Set availability flags: `status`, `isAvailable`, `isComingSoon`, `isFeatured` as needed.

## Troubleshooting
- Preview not showing: verify `previewImage` path exists under `public/templates/<id>/` and the filename matches.
- API errors loading manifests: ensure valid JSON and required fields; check `defaultSectionOrder` references existing `sections`.
- Tag issues: more than 3 will be trimmed; curate to the best 3.
