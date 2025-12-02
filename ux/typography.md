# Typography

Typography in Sacred Vows balances elegance with readability, using a carefully curated combination of serif, sans-serif, and script fonts.

---

## Font Families

### Primary Sans-Serif: Quicksand

**Usage**: Body text, UI elements, buttons, navigation

**Weights Available**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Characteristics**:
- Modern, friendly, highly readable
- Rounded letterforms feel approachable
- Excellent for small text and UI elements
- Good screen rendering at all sizes

```css
font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Elegant Serif: Cormorant Garamond

**Usage**: Headings, section titles, feature names, card titles

**Weights Available**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold) + Italics

**Characteristics**:
- Classic, sophisticated, romantic
- High contrast between thick and thin strokes
- Evokes timeless elegance
- Best at larger sizes (18px+)

```css
font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
```

### Script/Decorative: Great Vibes

**Usage**: Accent text, romantic phrases, names, decorative elements

**Weight**: 400 (Regular)

**Characteristics**:
- Flowing, romantic script
- Perfect for emotional emphasis
- Use sparingly for maximum impact
- Best at larger sizes (24px+)

```css
font-family: 'Great Vibes', cursive;
```

---

## Type Scale

### Desktop Scale

| Element | Size | Weight | Font | Line Height | Letter Spacing |
|---------|------|--------|------|-------------|----------------|
| Hero Title | 3.5rem (56px) | 500 | Cormorant | 1.15 | -0.5px |
| Hero Accent | 4.5rem (72px) | 400 | Great Vibes | 1.3 | 0 |
| Section Title | 2.75rem (44px) | 500 | Cormorant | 1.2 | -0.5px |
| Page Title | 3rem (48px) | 500 | Cormorant | 1.2 | -0.5px |
| Card Title | 1.35rem (22px) | 600 | Cormorant | 1.3 | 0 |
| Body Large | 1.05rem (17px) | 400 | Quicksand | 1.85 | 0 |
| Body | 1rem (16px) | 400 | Quicksand | 1.7 | 0 |
| Body Small | 0.9rem (14px) | 400 | Quicksand | 1.7 | 0 |
| Caption | 0.85rem (13.6px) | 400 | Quicksand | 1.6 | 0 |
| Label | 0.8rem (12.8px) | 600 | Quicksand | 1.4 | 2-3px |
| Button | 0.95rem (15px) | 600 | Quicksand | 1 | 0 |

### Mobile Scale

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero Title | 3.5rem | 2rem |
| Hero Accent | 4.5rem | 2.75rem |
| Section Title | 2.75rem | 1.85rem |
| Page Title | 3rem | 2rem |
| Card Title | 1.35rem | 1.2rem |
| Body | 1rem | 0.95rem |

---

## Usage Guidelines

### Headings

```css
/* Hero Title */
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  font-weight: 500;
  line-height: 1.15;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

/* Section Title */
.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.75rem;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

/* Card Title */
.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-dark);
}
```

### Body Text

```css
/* Body Large */
.body-large {
  font-family: 'Quicksand', sans-serif;
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--text-medium);
}

/* Body Regular */
.body {
  font-family: 'Quicksand', sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-medium);
}

/* Body Small */
.body-small {
  font-family: 'Quicksand', sans-serif;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-light);
}
```

### Labels & Captions

```css
/* Section Label */
.section-label {
  font-family: 'Quicksand', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--gold-dark);
}

/* Caption */
.caption {
  font-family: 'Quicksand', sans-serif;
  font-size: 0.85rem;
  color: var(--text-muted);
}
```

### Script Accents

```css
/* Romantic Accent */
.script-accent {
  font-family: 'Great Vibes', cursive;
  font-size: 4.5rem;
  font-weight: 400;
  line-height: 1.3;
  background: linear-gradient(135deg, var(--burgundy), var(--rose-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Principles

### 1. Hierarchy
Establish clear visual hierarchy through size, weight, and color. Headings should be immediately distinguishable from body text.

### 2. Readability
- Minimum body text size: 16px
- Maximum line length: 65-75 characters
- Sufficient line height (1.7-1.85 for body)
- Adequate contrast ratios

### 3. Consistency
Use the same font styles for similar elements across the application. Don't mix too many weights or sizes.

### 4. Romance with Restraint
Script fonts (Great Vibes) should be used sparingly for maximum emotional impact. Reserve for:
- Names
- Romantic phrases
- Accent words
- Decorative elements

### 5. Accessibility
- Never use font-size below 14px
- Maintain 4.5:1 contrast ratio minimum
- Don't rely solely on color for emphasis
- Ensure text is resizable to 200%

---

## Loading Fonts

### Google Fonts Link
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Great+Vibes&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Font Loading Strategy
```css
/* Use font-display: swap for performance */
@font-face {
  font-family: 'Quicksand';
  font-display: swap;
  /* ... */
}
```

---

## Do's and Don'ts

### Do's
✓ Use Cormorant Garamond for all headings
✓ Use Quicksand for body text and UI
✓ Reserve Great Vibes for special accents
✓ Maintain consistent line heights
✓ Use proper text colors from the palette

### Don'ts
✗ Mix multiple script fonts
✗ Use script fonts for body text
✗ Apply letter-spacing to script fonts
✗ Use light font weights below 14px
✗ Center-align long paragraphs

