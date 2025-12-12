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
  - `description`, `names` (display label), `date` (display date), `previewImage`, optional `previewImages: []`
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
  "names": "Aarav & Nisha",
  "date": "Feb 22, 2026",
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

`config.json` excerpt (brand-kit aware):
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
    "preset": "art-deco-gold",
    "colors": {
      "primary": "#d4af37",
      "secondary": "#0f0f10",
      "accent": "#f7d87c",
      "background": { "page": "#0a0a0c", "card": "#111116" },
      "text": { "primary": "#f5e9c9", "muted": "#bfb49b" }
    },
    "states": { "hover": { "primary": "#b78c24" }, "focus": { "ring": "0 0 0 3px rgba(212,175,55,0.4)" } },
    "gradients": { "hero": { "start": "rgba(212,175,55,0.18)", "end": "rgba(15,15,16,0.72)", "angle": "135deg" } },
    "radii": { "md": "12px", "xl": "28px" },
    "spacing": { "scale": { "sm": "12px", "md": "16px", "lg": "24px" }, "section": { "y": { "desktop": "72px" } } },
    "typography": {
      "family": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" },
      "sizes": { "h1": "42px", "body": "16px", "small": "13px" },
      "letterSpacing": { "caps": "0.08em" }
    },
    "buttons": { "primary": { "background": "#d4af37", "text": "#0f0f10", "hoverBackground": "#b78c24" } },
    "cards": { "surface": "#111116", "shadow": "0 18px 44px rgba(0,0,0,0.35)", "radius": "24px" },
    "dividers": { "color": "rgba(212,175,55,0.35)", "thickness": "1px" },
    "layout": { "container": { "maxWidth": "1100px" }, "grid": { "gutters": { "desktop": "20px" } } },
    "accessibility": { "focusRing": "0 0 0 3px rgba(212, 175, 55, 0.6)", "minTapSize": "44px" }
  }
}
```

### Theme/brand kit contract
- Core palette: `colors.primary|secondary|accent|muted`, `colors.background.page|card|raised|overlay`, `colors.text.primary|muted|onPrimary`.
- States: `states.hover|active|focus|disabled`.
- Gradients/overlays: `gradients.hero|cta`, `overlays.imageVeil|card|modal`.
- Foundations: `radii`, `borders`, `spacing.scale`, `spacing.section`, `layout.container`, `layout.breakpoints`, `layout.grid`.
- Typography: `typography.family`, `weights`, `sizes`, `lineHeights`, `letterSpacing`, `decorations`.
- Components: `links`, `buttons` (primary/ghost/outline/subtle), `forms`, `chips`, `cards`, `dividers`, `lists`, `icons`.
- Imagery and motion: `imagery`, `illustrations`, `motion`.
- Section layouts: `sections.hero|story|events|gallery|rsvp`, `cta.layouts`.
- Shell/accessibility: `shell.header|footer|social`, `accessibility.focusRing|contrastTarget|minTapSize`.

## Checklist for adding a template
- Create `templates/<template-id>/` using a URL-safe, lowercase slug.
- Add `manifest.json`, `config.json`, and `preview.jpg` (plus any `preview-*.jpg` referenced in `previewImages`).
- Cap `tags` to 3; ensure `previewImage` paths point to `/templates/<id>/...`.
- Add catalog display text: `names` (shown on landing cards; falls back to `name` if omitted) and `date` (optional; hides if omitted).
- Provide at least one theme; mark exactly one `isDefault: true`.
- Keep `sections` IDs consistent across manifest/config; include `defaultSectionOrder` covering all sections.
- Set availability flags: `status`, `isAvailable`, `isComingSoon`, `isFeatured` as needed.

## Troubleshooting
- Preview not showing: verify `previewImage` path exists under `public/templates/<id>/` and the filename matches.
- API errors loading manifests: ensure valid JSON and required fields; check `defaultSectionOrder` references existing `sections`.
- Tag issues: more than 3 will be trimmed; curate to the best 3.
