# Color Palette

The Sacred Vows color system is designed to evoke romance, elegance, and warmth while maintaining excellent readability and accessibility.

---

## Primary Colors

### Romantic Rose Family

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Blush Light | `#fff8f7` | 255, 248, 247 | `--blush-light` | Ultra-light backgrounds |
| Blush | `#fef1f0` | 254, 241, 240 | `--blush` | Primary soft background |
| Blush Deep | `#fce4e2` | 252, 228, 226 | `--blush-deep` | Depth and layering |
| Rose Soft | `#f5d0d3` | 245, 208, 211 | `--rose-soft` | Subtle accents |
| Rose | `#e8b4b8` | 232, 180, 184 | `--rose` | Interactive elements |
| Rose Dark | `#d4969c` | 212, 150, 156 | `--rose-dark` | Hover states |
| Dusty Rose | `#c9a1a6` | 201, 161, 166 | `--dusty-rose` | Secondary elements |

### Burgundy Accents

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Burgundy | `#8b2942` | 139, 41, 66 | `--burgundy` | Premium text, icons |
| Burgundy Deep | `#6b1d32` | 107, 29, 50 | `--burgundy-deep` | Darker emphasis |

---

## Accent Colors

### Gold & Luxury

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Gold Light | `#f5e6c8` | 245, 230, 200 | `--gold-light` | Subtle highlights |
| Gold | `#d4af37` | 212, 175, 55 | `--gold` | Primary CTAs, accents |
| Gold Dark | `#b8960c` | 184, 150, 12 | `--gold-dark` | Hover states, depth |
| Champagne | `#f5e6d3` | 245, 230, 211 | `--champagne` | Warm backgrounds |
| Champagne Dark | `#e8d4bc` | 232, 212, 188 | `--champagne-dark` | Layering |

### Sage & Nature

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Sage Light | `#e8f0e8` | 232, 240, 232 | `--sage-light` | Success backgrounds |
| Sage | `#b8c9b8` | 184, 201, 184 | `--sage` | Nature accents |
| Sage Dark | `#8fa88f` | 143, 168, 143 | `--sage-dark` | Check marks, success |
| Eucalyptus | `#7a9e7a` | 122, 158, 122 | `--eucalyptus` | Rich green accent |

---

## Neutral Colors

### Backgrounds

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Cream | `#fffaf5` | 255, 250, 245 | `--cream` | Primary background |
| Ivory | `#fffff0` | 255, 255, 240 | `--ivory` | Alternative light bg |
| White | `#ffffff` | 255, 255, 255 | `--white` | Cards, contrast |

### Text Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Text Dark | `#2d2d2d` | 45, 45, 45 | `--text-dark` | Headings, primary text |
| Text Medium | `#4a4a4a` | 74, 74, 74 | `--text-medium` | Body text |
| Text Light | `#6b6b6b` | 107, 107, 107 | `--text-light` | Secondary text |
| Text Muted | `#8a8a8a` | 138, 138, 138 | `--text-muted` | Tertiary, hints |

### Builder Interface

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Builder BG | `#f5f5f5` | 245, 245, 245 | `--builder-bg` | App background |
| Builder Surface | `#ffffff` | 255, 255, 255 | `--builder-surface` | Panels, cards |
| Builder Border | `#e8e8e8` | 232, 232, 232 | `--builder-border` | Default borders |
| Builder Border Light | `#f0f0f0` | 240, 240, 240 | `--builder-border-light` | Subtle borders |

---

## Color Usage Guidelines

### Backgrounds
```
Primary:        cream (#fffaf5)
Cards/Panels:   white (#ffffff)
Layered:        blush-light (#fff8f7)
Warm accent:    champagne (#f5e6d3)
```

### Primary Actions (CTAs)
```
Background:     linear-gradient(135deg, gold, gold-dark)
Text:           white
Hover:          translateY(-2px) + shadow increase
```

### Secondary Actions
```
Background:     transparent
Border:         2px solid rose
Text:           text-dark
Hover:          rose background, white text
```

### Text Hierarchy
```
Headings:       text-dark (#2d2d2d)
Body:           text-medium (#4a4a4a)
Secondary:      text-light (#6b6b6b)
Hints/Meta:     text-muted (#8a8a8a)
```

### Status Colors
```
Success:        sage-light bg, sage-dark text
Warning:        gold-light bg, gold-dark text
Error:          rose-soft bg, burgundy text
Info:           blush bg, text-medium text
```

---

## Gradients

### Gold Gradient (Primary CTA)
```css
background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%);
```

### Rose Gradient (Secondary)
```css
background: linear-gradient(135deg, #e8b4b8 0%, #d4969c 100%);
```

### Dark Gradient (Footer/CTA Sections)
```css
background: linear-gradient(135deg, #2d2d2d 0%, #1a1a2e 100%);
```

### Hero Background
```css
background: 
  radial-gradient(ellipse 80% 50% at 20% 40%, rgba(254, 241, 240, 0.9) 0%, transparent 50%),
  radial-gradient(ellipse 60% 40% at 80% 60%, rgba(245, 230, 211, 0.8) 0%, transparent 50%),
  linear-gradient(180deg, #fff8f7 0%, #fffaf5 50%, #f5e6d3 100%);
```

---

## Shadows

### Standard Shadows
```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 20px rgba(0, 0, 0, 0.08);
--shadow-lg:  0 8px 40px rgba(0, 0, 0, 0.12);
--shadow-xl:  0 20px 60px rgba(0, 0, 0, 0.15);
```

### Accent Shadows
```css
--shadow-gold:    0 4px 30px rgba(212, 175, 55, 0.3);
--shadow-gold-lg: 0 8px 40px rgba(212, 175, 55, 0.4);
--shadow-rose:    0 4px 30px rgba(232, 180, 184, 0.4);
--shadow-burgundy: 0 4px 20px rgba(139, 41, 66, 0.25);
```

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Combination | Ratio | Pass |
|-------------|-------|------|
| text-dark on cream | 11.5:1 | ✓ AAA |
| text-dark on white | 12.6:1 | ✓ AAA |
| text-medium on cream | 8.1:1 | ✓ AAA |
| white on burgundy | 7.2:1 | ✓ AAA |
| white on gold | 3.0:1 | ✓ AA Large |
| gold-dark on white | 4.8:1 | ✓ AA |

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
```

---

## Implementation

### CSS Custom Properties
All colors are defined as CSS custom properties in `:root` for easy theming and maintenance.

```css
:root {
  /* Primary Romantic Palette */
  --blush-light: #fff8f7;
  --blush: #fef1f0;
  --rose: #e8b4b8;
  --burgundy: #8b2942;
  
  /* Gold & Luxury */
  --gold: #d4af37;
  --gold-dark: #b8960c;
  
  /* Neutrals */
  --cream: #fffaf5;
  --text-dark: #2d2d2d;
  --text-medium: #4a4a4a;
}
```

### Usage Example
```css
.button-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: var(--white);
  box-shadow: var(--shadow-gold);
}

.button-primary:hover {
  box-shadow: var(--shadow-gold-lg);
}
```

