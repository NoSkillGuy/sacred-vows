# UI Components

Standard component patterns and specifications for the Sacred Vows design system.

---

## Buttons

### Primary Button (CTA)
The main call-to-action button with gold gradient.

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  color: var(--white);
  border: none;
  padding: 1rem 2rem;
  border-radius: 100px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s var(--ease-out-expo);
  box-shadow: var(--shadow-gold);
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-gold-lg);
}
```

**Specs**:
- Padding: 1rem 2rem (16px 32px)
- Border radius: 100px (pill shape)
- Font size: 0.95rem (15px)
- Font weight: 600

### Secondary Button
Outlined button for secondary actions.

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: var(--text-dark);
  border: 2px solid var(--rose);
  padding: 0.95rem 1.75rem;
  border-radius: 100px;
  font-size: 0.95rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--rose);
  color: var(--white);
  transform: translateY(-2px);
}
```

### Ghost Button
Subtle button for tertiary actions.

```css
.btn-ghost {
  background: var(--blush-light);
  color: var(--text-dark);
  border: 1px solid var(--builder-border);
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
}

.btn-ghost:hover {
  background: var(--blush);
  border-color: var(--rose);
}
```

### Button States
- **Default**: Base styling
- **Hover**: translateY(-2px to -3px), increased shadow
- **Focus**: 2px gold outline with 2px offset
- **Disabled**: 60% opacity, cursor not-allowed

---

## Cards

### Standard Card

```css
.card {
  background: var(--white);
  border-radius: var(--radius-xl); /* 24px */
  padding: 2.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--builder-border-light);
  transition: all 0.4s var(--ease-out-expo);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}
```

**Specs**:
- Border radius: 24px
- Padding: 2.5rem (40px)
- Shadow: shadow-sm → shadow-lg on hover
- Hover lift: translateY(-8px)

### Feature Card
With icon and hover accent.

```css
.feature-card {
  background: var(--white);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--rose), var(--gold));
  border-radius: 0 0 4px 4px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover::before {
  opacity: 1;
}
```

### Layout Card
For layout previews with overlay.

```css
.layout-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 3/4;
  transition: all 0.5s var(--ease-out-expo);
}

.layout-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-xl);
}

.layout-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.layout-card:hover .layout-overlay {
  opacity: 1;
}
```

---

## Form Elements

### Text Input

```css
.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--builder-border);
  border-radius: var(--radius-md); /* 10px */
  font-family: 'Quicksand', sans-serif;
  font-size: 1rem;
  color: var(--text-dark);
  background: var(--white);
  transition: all 0.2s var(--ease-out-quart);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--rose);
  box-shadow: 0 0 0 4px rgba(232, 180, 184, 0.15);
}
```

### Select Dropdown

```css
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron */
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
  cursor: pointer;
}
```

### Textarea

```css
.form-textarea {
  min-height: 150px;
  resize: vertical;
}
```

### Form Label

```css
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-medium);
}
```

---

## Navigation

### Desktop Navigation

```css
.nav-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-medium);
  position: relative;
  padding: 0.25rem 0;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1.5px;
  background: linear-gradient(90deg, var(--gold), var(--gold-dark));
  transition: width 0.3s var(--ease-out-expo);
}

.nav-links a:hover::after {
  width: 100%;
}
```

### Mobile Navigation
Full-screen overlay with glass-morphism.

```css
.mobile-nav {
  position: fixed;
  inset: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
```

---

## Badges

### Standard Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-gold {
  background: var(--gold-light);
  color: var(--gold-dark);
}

.badge-rose {
  background: var(--rose-soft);
  color: var(--burgundy);
}

.badge-sage {
  background: var(--sage-light);
  color: var(--sage-dark);
}
```

---

## Modals

### Modal Overlay

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
```

### Modal Content

```css
.modal-content {
  background: var(--white);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--builder-border-light);
  background: linear-gradient(180deg, var(--blush-light) 0%, var(--white) 100%);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--builder-border-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: var(--blush-light);
}
```

---

## Icons

### Icon Container

```css
.icon-container {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, var(--blush) 0%, var(--rose-soft) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container svg {
  width: 32px;
  height: 32px;
  color: var(--burgundy);
}
```

### Icon Sizing
- Small: 16px
- Medium: 20px
- Large: 24px
- XL: 32px

---

## Loading States

### Spinner

```css
.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--builder-border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Loading Dots

```css
.loading-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--gold);
  border-radius: 50%;
  animation: loadingDot 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
```

---

## Border Radius Tokens

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 100px; /* pills */
```

