# Spacing & Layout

Consistent spacing and layout patterns for the Sacred Vows design system.

---

## Spacing Scale

Base unit: 8px (0.5rem)

| Token | Value | Use Case |
|-------|-------|----------|
| `0.25rem` | 4px | Inline elements, tight gaps |
| `0.5rem` | 8px | Small internal spacing |
| `0.75rem` | 12px | Form element gaps |
| `1rem` | 16px | Standard spacing |
| `1.25rem` | 20px | Medium internal padding |
| `1.5rem` | 24px | Section internal spacing |
| `2rem` | 32px | Card padding, component gaps |
| `2.5rem` | 40px | Large card padding |
| `3rem` | 48px | Section gaps |
| `4rem` | 64px | Page section padding |
| `5rem` | 80px | Large section gaps |
| `6rem` | 96px | Hero section padding |
| `7rem` | 112px | Maximum section padding |

---

## Section Padding

### Desktop
```css
--section-padding: 7rem 4rem; /* 112px 64px */
```

### Tablet
```css
--section-padding: 5rem 3rem; /* 80px 48px */
```

### Mobile
```css
--section-padding-mobile: 4rem 1.5rem; /* 64px 24px */
```

---

## Container Widths

```css
--max-width: 1280px;        /* Content maximum width */
--max-width-narrow: 800px;  /* Article/legal pages */
--max-width-wide: 1400px;   /* Full-width sections */
```

### Container Pattern
```css
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 4rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }
}
```

---

## Grid System

### Standard Grid
```css
.grid {
  display: grid;
  gap: 2rem;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
```

### Responsive Behavior
```css
/* Desktop: 3 columns */
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet: 2 columns */
@media (max-width: 1024px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column */
@media (max-width: 768px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

---

## Component Spacing

### Cards
```css
.card {
  padding: 2.5rem;      /* Internal padding */
  margin-bottom: 2rem;   /* Between cards */
}

@media (max-width: 768px) {
  .card {
    padding: 1.75rem;
  }
}
```

### Sections
```css
.section {
  padding: var(--section-padding);
  margin-bottom: 0; /* No margin, use padding */
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}
```

### Forms
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  margin-bottom: 0.5rem;
}

.form-actions {
  margin-top: 2rem;
  gap: 0.75rem;
}
```

### Buttons
```css
.btn {
  padding: 0.9rem 2rem;
  gap: 0.5rem; /* Between icon and text */
}

.btn-small {
  padding: 0.6rem 1.25rem;
}

.btn-large {
  padding: 1.15rem 2.75rem;
}
```

---

## Breakpoints

```css
/* Mobile first approach */

/* Small phones */
@media (min-width: 320px) { }

/* Large phones */
@media (min-width: 480px) { }

/* Tablets */
@media (min-width: 768px) { }

/* Small desktops */
@media (min-width: 1024px) { }

/* Large desktops */
@media (min-width: 1200px) { }

/* Extra large */
@media (min-width: 1440px) { }
```

### Common Breakpoint Patterns

```css
/* Desktop navigation → Mobile menu */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: block; }
}

/* 3-column → 2-column → 1-column */
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
}
```

---

## Page Layout

### Standard Page Structure
```
┌─────────────────────────────────────────┐
│              Header (sticky)            │
├─────────────────────────────────────────┤
│                                         │
│             Page Hero                   │
│         (title, breadcrumbs)            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           Page Content                  │
│     (max-width: 1400px centered)        │
│                                         │
│         ┌───────────────────┐          │
│         │    Section 1      │          │
│         └───────────────────┘          │
│                                         │
│         ┌───────────────────┐          │
│         │    Section 2      │          │
│         └───────────────────┘          │
│                                         │
├─────────────────────────────────────────┤
│                Footer                   │
└─────────────────────────────────────────┘
```

### Hero Section Dimensions
- Height: auto (content-based)
- Padding: 5rem 4rem (desktop), 3rem 1.5rem (mobile)

### Footer Dimensions
- Padding: 5rem 4rem 2rem (desktop)
- 4-column grid (desktop) → 2-column (tablet) → 1-column (mobile)

---

## Z-Index Scale

```css
--z-dropdown: 10;
--z-sticky: 50;
--z-fixed: 100;
--z-modal-backdrop: 900;
--z-modal: 1000;
--z-popover: 1100;
--z-tooltip: 1200;
```

---

## Whitespace Guidelines

### Generous Whitespace
Sacred Vows uses generous whitespace to:
- Create visual breathing room
- Establish content hierarchy
- Convey elegance and premium feel

### Rule of Thumb
- Double the spacing when in doubt
- Related items closer, unrelated further
- More whitespace around important elements

### Example
```css
/* Section spacing progression */
.section {
  padding: 7rem 4rem;           /* Outer: Maximum */
}

.section-header {
  margin-bottom: 4rem;          /* After header: Large */
}

.section-title {
  margin-bottom: 1rem;          /* Title to subtitle: Small */
}

.cards-grid {
  gap: 2rem;                    /* Between cards: Medium */
}

.card-content {
  padding: 2.5rem;              /* Inside card: Medium-large */
}

.card-title {
  margin-bottom: 0.75rem;       /* Title to text: Small */
}
```

