# Motion & Animation

Animation guidelines for creating delightful, performant experiences in Sacred Vows.

---

## Principles

### 1. Natural Movement
Animations should feel organic and natural, not mechanical. Think of rose petals falling or gentle ocean waves.

### 2. Purposeful
Every animation should serve a purpose:
- **Reveal**: Introduce content gracefully
- **Feedback**: Confirm user actions
- **Delight**: Add moments of joy
- **Guide**: Direct attention

### 3. Performant
- Target 60fps on all devices
- Use CSS transforms (not layout properties)
- Respect user preferences for reduced motion

### 4. Restrained
More animation is not better. Use animation sparingly for maximum impact.

---

## Easing Functions

```css
/* Primary easings */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* Smooth, elegant reveals */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* Standard interactions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);       /* Balanced transitions */
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);       /* Playful bounces */
```

### When to Use Each

| Easing | Use Case |
|--------|----------|
| `ease-out-expo` | Page transitions, content reveals, major animations |
| `ease-out-quart` | Button hovers, card lifts, standard interactions |
| `ease-in-out` | Toggles, expand/collapse, bidirectional motion |
| `spring` | Success states, playful micro-interactions |

---

## Timing

### Duration Guidelines

| Duration | Use Case | Example |
|----------|----------|---------|
| 0.1-0.2s | Micro-interactions | Button color change |
| 0.2-0.3s | Hover states | Card lift, underline |
| 0.3-0.5s | Minor transitions | Dropdown, tooltip |
| 0.4-0.6s | Standard transitions | Modal open, content reveal |
| 0.6-1.0s | Major reveals | Page transitions, hero animation |
| 6-20s | Continuous | Background gradients, floating elements |

---

## Hover Interactions

### Card Hover
```css
.card {
  transition: all 0.4s var(--ease-out-expo);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}
```

### Button Hover
```css
.btn-primary {
  transition: all 0.3s var(--ease-out-quart);
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-gold-lg);
}
```

### Link Underline
```css
.nav-link::after {
  content: '';
  width: 0;
  height: 1.5px;
  background: linear-gradient(90deg, var(--gold), var(--gold-dark));
  transition: width 0.3s var(--ease-out-expo);
}

.nav-link:hover::after {
  width: 100%;
}
```

---

## Entrance Animations

### Staggered Reveal
```css
.hero-content > * {
  opacity: 0;
  transform: translateY(30px);
}

.hero-content.mounted > * {
  opacity: 1;
  transform: translateY(0);
}

.hero-content > *:nth-child(1) { transition: all 0.8s var(--ease-out-expo) 0.1s; }
.hero-content > *:nth-child(2) { transition: all 0.8s var(--ease-out-expo) 0.2s; }
.hero-content > *:nth-child(3) { transition: all 0.8s var(--ease-out-expo) 0.3s; }
.hero-content > *:nth-child(4) { transition: all 0.8s var(--ease-out-expo) 0.4s; }
```

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s var(--ease-out-expo);
}
```

---

## Continuous Animations

### Floating Elements
```css
@keyframes gentleFloat {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  25% {
    transform: translateY(-12px) rotate(3deg);
  }
  75% {
    transform: translateY(8px) rotate(-3deg);
  }
}

.floating-element {
  animation: gentleFloat 8s ease-in-out infinite;
}
```

### Background Gradient Shift
```css
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 0%, 100% 100%;
  }
  50% {
    background-position: 100% 100%, 0% 0%;
  }
}

.hero-bg {
  animation: gradientShift 20s ease-in-out infinite;
}
```

### Falling Petals
```css
@keyframes petalFall {
  0% {
    transform: translateY(-10%) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(110vh) translateX(100px) rotate(720deg);
    opacity: 0;
  }
}

.petal {
  animation: petalFall linear infinite;
}
```

### Shimmer Effect
```css
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.shimmer-text {
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Micro-interactions

### Button Arrow Slide
```css
.btn .arrow {
  transition: transform 0.3s var(--ease-out-expo);
}

.btn:hover .arrow {
  transform: translateX(4px);
}
```

### Checkbox/Toggle
```css
.toggle {
  transition: background-color 0.2s var(--ease-in-out);
}

.toggle-knob {
  transition: transform 0.3s var(--spring);
}

.toggle.active .toggle-knob {
  transform: translateX(20px);
}
```

### Loading Spinner
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.8s linear infinite;
}
```

---

## Accessibility

### Reduced Motion
Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### What to Keep
Even with reduced motion, maintain:
- Instant feedback (color changes)
- Essential state indicators
- Focus indicators

---

## Performance Tips

### Use Transform Properties
```css
/* ✓ Good - GPU accelerated */
transform: translateX(10px);
transform: scale(1.1);
transform: rotate(5deg);
opacity: 0.5;

/* ✗ Avoid - Causes layout/paint */
left: 10px;
width: 110%;
margin-left: 10px;
```

### Will-Change (Use Sparingly)
```css
/* Only for elements that will definitely animate */
.will-animate {
  will-change: transform, opacity;
}
```

### Avoid Animating These
- `width`, `height`
- `margin`, `padding`
- `top`, `right`, `bottom`, `left`
- `border-width`
- `font-size`

---

## Animation Checklist

Before adding an animation, ask:
1. Does it serve a purpose?
2. Is it performant (60fps)?
3. Does it respect reduced motion?
4. Is the duration appropriate?
5. Does the easing feel natural?
6. Is it consistent with other animations?

