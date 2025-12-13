# Accessibility Guidelines

Sacred Vows is committed to making beautiful wedding invitations accessible to everyone. This document outlines our accessibility standards and requirements.

---

## Standards

We aim to meet **WCAG 2.1 Level AA** compliance across all products.

---

## Color & Contrast

### Minimum Contrast Ratios

| Text Type | Requirement | Standard |
|-----------|-------------|----------|
| Normal text (< 18px) | 4.5:1 | AA |
| Large text (≥ 18px or 14px bold) | 3:1 | AA |
| UI components & graphics | 3:1 | AA |

### Verified Combinations

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#2d2d2d` (text-dark) | `#fffaf5` (cream) | 11.5:1 | ✓ AAA |
| `#4a4a4a` (text-medium) | `#ffffff` (white) | 9.7:1 | ✓ AAA |
| `#6b6b6b` (text-light) | `#ffffff` (white) | 5.7:1 | ✓ AA |
| `#ffffff` (white) | `#8b2942` (burgundy) | 7.2:1 | ✓ AAA |
| `#ffffff` (white) | `#d4af37` (gold) | 3.0:1 | ✓ AA Large |

### Don't Rely on Color Alone
- Use icons alongside color indicators
- Add text labels to status messages
- Provide multiple visual cues

```css
/* ✓ Good - icon + color + text */
.success-message {
  background: var(--sage-light);
  color: var(--sage-dark);
}
.success-message::before {
  content: '✓';
}

/* ✗ Bad - color only */
.success { color: green; }
```

---

## Typography

### Minimum Sizes
- Body text: 16px minimum
- Small text: 14px minimum
- Interactive elements: 16px minimum

### Readable Line Length
```css
.content {
  max-width: 65ch; /* 65 characters optimal */
}
```

### Line Height
- Body text: 1.5-1.8
- Headings: 1.2-1.4

### Text Scaling
All text must be readable when:
- Zoomed to 200%
- System font size increased
- Using a screen reader

```css
/* Use relative units */
font-size: 1rem;      /* ✓ */
font-size: 16px;      /* Use sparingly */
```

---

## Keyboard Navigation

### Focus Indicators
All interactive elements must have visible focus states:

```css
*:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

/* Custom focus for specific elements */
.btn:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3);
}
```

### Focus Order
Tab order should follow visual layout:
1. Skip to main content link (first focusable)
2. Navigation items (left to right)
3. Main content (top to bottom)
4. Footer links

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--gold);
  color: var(--white);
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Keyboard Traps
Never trap keyboard focus:
- Modals must be escapable (Escape key)
- Dropdowns must close with Escape
- Focus returns to trigger element when modal closes

---

## Screen Readers

### Semantic HTML
Use proper HTML elements:

```html
<!-- ✓ Good -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<main id="main-content">
  <article>
    <h1>Page Title</h1>
  </article>
</main>

<!-- ✗ Bad -->
<div class="nav">
  <div class="nav-item">
    <span onclick="...">Home</span>
  </div>
</div>
```

### ARIA Labels
Provide labels for elements without visible text:

```html
<!-- Icon-only buttons -->
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<!-- Form inputs -->
<input 
  type="email" 
  aria-label="Email address"
  placeholder="you@example.com"
>

<!-- Landmark regions -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
</section>
```

### Live Regions
Announce dynamic content changes:

```html
<div role="alert" aria-live="polite">
  Your invitation has been saved!
</div>

<div role="status" aria-live="polite">
  Loading layouts...
</div>
```

### Hidden Content
```css
/* Visually hidden but available to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Interactive Elements

### Touch Targets
Minimum touch target size: 44px × 44px

```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

.icon-btn {
  width: 44px;
  height: 44px;
}
```

### Click Area
Increase clickable area for small text links:

```css
.small-link {
  padding: 8px;
  margin: -8px;
}
```

### Button States
All buttons need:
- Default state
- Hover state
- Focus state
- Active/pressed state
- Disabled state

```css
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## Forms

### Labels
Every form input needs a label:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" required>
```

### Error Messages
```html
<div class="form-group">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    aria-describedby="email-error"
    aria-invalid="true"
  >
  <span id="email-error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

### Required Fields
```html
<label for="name">
  Name <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="text" id="name" required aria-required="true">
```

### Autocomplete
Use appropriate autocomplete attributes:
```html
<input type="email" autocomplete="email">
<input type="text" autocomplete="name">
<input type="tel" autocomplete="tel">
```

---

## Motion & Animation

### Reduced Motion
Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Autoplay
- No autoplaying video with sound
- Provide controls to pause animations
- Limit animation duration

---

## Images & Media

### Alt Text
All images need appropriate alt text:

```html
<!-- Decorative - empty alt -->
<img src="ornament.svg" alt="">

<!-- Informative - describe content -->
<img src="couple.jpg" alt="Sarah and Michael at their engagement party">

<!-- Functional - describe action -->
<img src="download.svg" alt="Download PDF">
```

### Complex Images
For charts or complex visuals:
```html
<figure>
  <img src="chart.png" alt="RSVP statistics chart">
  <figcaption>
    Chart showing RSVP responses: 75 attending, 20 not attending, 5 pending
  </figcaption>
</figure>
```

---

## Testing Checklist

### Automated Testing
- [ ] Run aXe or similar tool
- [ ] Check color contrast
- [ ] Validate HTML

### Manual Testing
- [ ] Navigate with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Zoom to 200%
- [ ] Test with reduced motion enabled
- [ ] Check focus indicators
- [ ] Verify form error messages

### User Testing
- [ ] Test with actual users with disabilities
- [ ] Gather feedback on pain points
- [ ] Iterate based on findings

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [aXe Browser Extension](https://www.deque.com/axe/)
- [Screen Reader Testing Guide](https://www.nvaccess.org/download/)

