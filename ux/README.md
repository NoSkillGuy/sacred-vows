# Sacred Vows - UX & Brand Guidelines

Welcome to the Sacred Vows design system documentation. This folder contains comprehensive brand guidelines, design tokens, and UX patterns for building consistent, beautiful experiences across the platform.

## Quick Reference

| Document | Description |
|----------|-------------|
| [Brand Guidelines](./brand-guidelines.md) | Complete brand identity, mission, and values |
| [Color Palette](./color-palette.md) | Color system with hex codes and usage |
| [Typography](./typography.md) | Font families, scales, and usage guidelines |
| [Components](./components.md) | UI component patterns and specifications |
| [Spacing & Layout](./spacing-and-layout.md) | Grid system and spacing tokens |
| [Motion & Animation](./motion-and-animation.md) | Animation principles and timing |
| [Accessibility](./accessibility.md) | A11y requirements and best practices |
| [Voice & Tone](./voice-and-tone.md) | Copy guidelines and brand voice |

## Brand at a Glance

### Mission
Make beautiful, personalized wedding invitations accessible to every couple.

### Brand Essence
**Romantic. Elegant. Accessible.**

### Primary Colors
- **Gold**: `#d4af37` - Primary accent, CTAs, luxury elements
- **Rose**: `#e8b4b8` - Secondary accent, interactive elements
- **Burgundy**: `#8b2942` - Text accents, premium elements
- **Cream**: `#fffaf5` - Primary background

### Typography
- **Headings**: Cormorant Garamond (serif)
- **Body**: Quicksand (sans-serif)
- **Script**: Great Vibes (decorative accents)

### Design Principles
1. **Emotion-First**: Every element evokes romance and joy
2. **Premium Feel**: Sophisticated without being ostentatious
3. **Customer-Centric**: Clear value, intuitive flows
4. **Accessible**: Beautiful design that works for everyone

## File Structure

```
ux/
├── README.md                    # This file
├── brand-guidelines.md          # Complete brand identity
├── color-palette.md             # Color system
├── typography.md                # Font specifications
├── components.md                # UI component patterns
├── spacing-and-layout.md        # Layout system
├── motion-and-animation.md      # Animation guidelines
├── accessibility.md             # A11y requirements
└── voice-and-tone.md            # Copy guidelines
```

## Implementation Notes

### CSS Variables
All design tokens are implemented as CSS custom properties in:
- `apps/builder/src/styles/index.css` - Global shared tokens
- `apps/builder/src/components/Landing/LandingPage.css` - Landing page specific tokens

### Component Library
Reusable UI components with brand styling are located in:
- `apps/builder/src/components/Pages/PageLayout.jsx` - Shared page layout
- `apps/builder/src/components/Pages/PageLayout.css` - Shared page styles

## Updates & Maintenance

This documentation should be updated whenever:
- Brand colors or typography change
- New component patterns are established
- Design system tokens are modified
- New UX patterns are introduced

**Last Updated**: December 2024
**Maintained By**: Design & Development Team

