# Editorial Elegance Layout

A luxury magazine-style wedding invitation layout inspired by Vogue and Harper's Bazaar editorials. This layout emphasizes minimal design, generous white space, typography-first approach, and editorial photography treatment.

## Design Philosophy

**"When a guest opens the site, they should feel: This couple has taste."**

Editorial Elegance is built on these core principles:

- **Minimal**: Fewer sections, more breathing space
- **High-fashion**: Every section feels like a magazine spread
- **Typography-led**: Content is curated through exceptional typography
- **Calm, confident, premium**: Zero clutter, zero over-decoration
- **Editorial photography**: Photos are treated like editorial photography, not albums

## Color Palette (STRICT)

The layout uses a strict 5-color palette. **DO NOT add additional colors.**

| Purpose | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Background | Ivory off-white | `#FAF9F7` | Page background |
| Primary Text | Near black | `#1C1C1C` | Main text content |
| Secondary Text | Soft grey | `#6B6B6B` | Meta information, dates |
| Accent | Champagne gold | `#C6A15B` | **SUBTLE USE ONLY** - thin lines, small icons, hover states |
| Divider Lines | Light grey | `#E6E6E6` | Section dividers |

### Accent Color Usage Rules

⚠️ **CRITICAL**: The accent color should ONLY be used for:
- Thin lines and dividers
- Small icons
- Hover states
- Subtle borders

**NEVER use the accent color for:**
- Large blocks
- Headings
- Backgrounds
- Buttons (use text + thin border instead)

## Typography Scale

### Font Families

- **Heading Font**: Playfair Display (luxury serif)
- **Body Font**: Inter (clean sans-serif)
- **Script Font**: Playfair Display (reuse heading for consistency)

### Type Scale

| Element | Size | Weight | Letter Spacing |
|---------|------|--------|----------------|
| Hero Names | 64–80px (clamp) | 400 | -0.02em |
| Section Headings | 36–42px (clamp) | 400 | -0.02em |
| Sub-headings | 20–24px (clamp) | 400 | normal |
| Body Text | 18px | 400 | normal |
| Meta / Dates | 12–14px | 500 | 0.1em (uppercase) |

### Typography Guidelines

1. **Headings**: Use serif font, tight letter-spacing for elegance
2. **Meta text**: Always uppercase with generous letter-spacing
3. **Editorial intro**: Italic, light weight, generous line-height (1.7)
4. **Body text**: Clean sans-serif, comfortable line-height (1.6)

## Layout Sections

### 1. Editorial Cover (Hero)

**Purpose**: Full-height magazine cover

**Features**:
- Full viewport height
- Image OR muted video background
- Minimal overlay (10-15% max)
- Centered or bottom-left text alignment
- Thin divider line below names
- Subtle scroll indicator

**Content**:
- Couple names (large serif)
- Wedding date (uppercase, letter-spaced)
- City location

### 2. Editorial Intro

**Purpose**: Magazine-style opening paragraph

**Layout**:
- Two-column: text + portrait image
- OR centered text with negative space
- Max 3-4 lines of text
- Italic serif font

**Example Text**:
```
Two paths, one story.
Rooted in tradition, bound by love,
we invite you to celebrate the beginning of forever.
```

### 3. The Couple (Optional)

**Purpose**: Minimal editorial section for bride and groom

**Design**:
- Side-by-side layout with two photos
- Clean, minimal presentation
- No family details - keep it editorial
- Serif heading font for names
- Meta text labels ("THE BRIDE", "THE GROOM")

**Features**:
- Two-column grid layout
- Consistent photo sizing (400px height)
- Responsive: stacks to single column on mobile
- Follows editorial-elegance color palette and typography

### 4. Event Schedule

**Purpose**: Horizontal card-based event schedule

**Design**:
- Minimal cards with thin borders
- NO icons or illustrations
- Hover: slight shadow or border darken
- Event name in serif
- Details in sans-serif

**Card Structure**:
```
EVENT NAME
14 FEBRUARY 2026

Venue Name
City

Time
```

### 5. Wedding Party (Optional)

**Purpose**: Optional party members (bridesmaids, groomsmen, etc.)

**Features**:
- 2-4 photos in grid
- Black & white filter recommended
- NO titles like "Best Man", "Maid of Honor"
- Keep it editorial, not ceremonial
- Optional 1-line bios (max 100 chars)

**Note**: Bride and groom are shown in the separate "The Couple" section.

### 6. Location

**Purpose**: Venue details with embedded map

**Layout**:
- Left: venue details
- Right: desaturated Google Map

**Design**:
- Map should be desaturated (grayscale 40%, contrast 85%)
- "Open in Maps" as subtle text link
- No big buttons

### 6. Gallery

**Purpose**: Editorial-style photo showcase

**Layout Options**:
- Masonry grid (3 columns desktop, 2 mobile)
- OR single-column scroll

**Rules**:
- 8–12 images max
- Large images preferred
- NO captions
- Lazy loading
- High-quality editorial-style photos recommended

### 7. RSVP

**Purpose**: Ultra-minimal centered RSVP form

**Design**:
- Thin underline inputs (no boxes)
- Text-only submit button
- No bright colors
- Centered layout

**Fields**:
- Name
- Attendance (Yes/No)
- Guest count
- Message (optional)

### 8. Footer

**Purpose**: Minimal footer with couple names

**Content**:
- Couple names (serif, 32px)
- "With love and gratitude"
- Thin divider
- Copyright year

## Spacing Scale

The layout uses generous spacing for magazine-like breathing room:

| Variable | Size | Usage |
|----------|------|-------|
| `--ee-space-xs` | 12px | Tight spacing |
| `--ee-space-sm` | 24px | Small gaps |
| `--ee-space-md` | 48px | Medium spacing |
| `--ee-space-lg` | 80px | Large spacing |
| `--ee-space-xl` | 120px | Extra large spacing |
| `--ee-space-section` | clamp(80px, 10vh, 160px) | Between sections |

**Rule**: When in doubt, add MORE white space, not less.

## Animations & Interactions

### Allowed

- Fade-in on scroll (subtle)
- Very slow parallax (hero only)
- Hover underline on links
- Smooth transitions (0.2–0.3s)

### NOT Allowed ❌

- Bounce
- Zoom
- Slide-in from sides
- Confetti
- Heavy Lottie animations
- Anything "flashy"

## Mobile Experience

**Goal**: Feel like flipping a magazine on mobile

### Rules

1. Large text (maintain readability)
2. Full-width images
3. Events stacked vertically
4. No tiny buttons
5. Thumb-friendly RSVP
6. Generous tap targets (min 44px)

### Breakpoints

- Desktop: > 768px
- Tablet: 481px – 768px
- Mobile: ≤ 480px

## Theme Customization

### Available Themes

1. **Editorial Classic** (Default)
   - Background: `#FAF9F7`
   - Text: `#1C1C1C`
   - Accent: `#C6A15B`

2. **Warm Editorial**
   - Background: `#FAF7F2`
   - Text: `#2C2416`
   - Accent: `#B8956A`

3. **Cool Editorial**
   - Background: `#F9FAFB`
   - Text: `#1A1D23`
   - Accent: `#94A3B8`

### Customization Options

Users can customize:
- Hero alignment (center / bottom-left)
- Serif font selector
- Accent color (restricted palette)
- Show/hide sections
- Image shape (square / portrait)
- Gallery layout (masonry / single-column)

## Data Structure

### Required Data

```javascript
{
  couple: {
    bride: { name, image },
    groom: { name, image }
  },
  wedding: {
    dates: ['2026-02-15'],
    venue: { name, address, city, state, mapsUrl, mapsEmbedUrl }
  },
  hero: {
    mainImage: '/path/to/image.jpg',
    videoUrl: '/path/to/video.mp4', // optional
    alignment: 'center' // or 'bottom-left'
  }
}
```

### Optional Data

```javascript
{
  editorialIntro: {
    text: 'Your editorial intro text...',
    image: '/path/to/portrait.jpg',
    alignment: 'right' // or 'left'
  },
  weddingParty: {
    bride: { name, image, bio },
    groom: { name, image, bio },
    members: [
      { name, image, bio, role }
    ],
    showBios: false,
    filter: 'bw' // or 'none'
  },
  events: {
    events: [
      { label, date, time, venue }
    ]
  },
  gallery: {
    images: [
      { src, alt }
    ]
  },
  galleryConfig: {
    layout: 'masonry', // or 'single-column'
    maxImages: 12
  }
}
```

## Best Practices

### For Designers

1. **Less is more**: Curate content, don't dump everything
2. **White space is content**: Generous spacing is intentional
3. **Typography hierarchy**: Let type do the heavy lifting
4. **Photo quality**: Use large, high-quality editorial-style photos
5. **Color discipline**: Stick to the 5-color palette

### For Developers

1. **Maintain spacing**: Use CSS variables, don't hardcode
2. **Respect typography**: Use the defined type scale
3. **Performance**: Lazy load images, optimize assets
4. **Accessibility**: Maintain contrast ratios, keyboard navigation
5. **Mobile first**: Test on actual devices

### For Content Creators

1. **Keep text concise**: 3-4 lines for editorial intro
2. **Curate photos**: 8-12 best images, not 50
3. **Quality over quantity**: One great photo > five mediocre ones
4. **Professional photography**: Editorial style works best with pro photos
5. **Consistent style**: All photos should have similar tone/style

## Who This Layout Is For

Perfect for:
- Urban weddings
- Destination weddings
- Minimalist couples
- Design-conscious couples
- Premium audience
- Couples who appreciate subtle luxury and modern aesthetics

## Technical Notes

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox
- CSS Custom Properties
- CSS clamp() for responsive typography

### Performance

- Lazy loading for gallery images
- Optimized CSS (no unused styles)
- Minimal JavaScript
- Fast initial paint

### Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML
- Keyboard navigation
- Screen reader friendly
- Sufficient color contrast

## Version History

- **v1.0.0** (2025-12-15): Initial release
  - 8 core sections
  - 3 theme variants
  - Video hero support
  - Masonry gallery
  - Wedding party section
  - Embedded maps

## Support

For questions or issues with this layout, please refer to the [Layout Development Guide](../LAYOUT_DEVELOPMENT_GUIDE.md).

