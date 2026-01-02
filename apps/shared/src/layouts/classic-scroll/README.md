# Classic Scroll Layout

A traditional, elegant wedding invitation layout featuring a single-column vertical scroll design with centered content and sequential narrative flow.

## Overview

The Classic Scroll layout is designed for traditional and formal weddings. It features:
- Elegant typography with serif headings and clean body text
- Generous spacing and centered content
- Sequential narrative flow that guides guests through the celebration story
- Rich theming options (Royal Gold, Rose Blush, Sage Green, Navy Elegance)
- Full responsive design optimized for all devices

## Structure

### Directory Organization

```
classic-scroll/
├── index.js                    # Main registration file
├── manifest.js                 # Layout manifest and metadata
├── README.md                   # This file
├── components/
│   ├── view/                   # View-only components (for preview)
│   ├── editable/               # Editable components (for builder)
│   ├── shared/                 # Shared components (modals, utilities)
│   └── index.js                # Component exports
├── styles/
│   ├── main.css                # Main layout styles
│   ├── components.css          # Component-specific styles
│   ├── EditableText.css        # Editable text styles
│   ├── EditableImage.css       # Editable image styles
│   └── index.js                # Style exports
├── hooks/
│   └── useEditable.js          # Layout-specific hooks
├── export/
│   ├── template.js             # HTML generation for export
│   ├── styles.js               # CSS generation for export
│   └── index.js                # Export logic
└── tests/
    ├── components/             # Component tests
    ├── export/                 # Export tests
    └── integration/            # Integration tests
```

## Sections

### Required Sections
- **Header**: Top navigation with language selector and branding
- **Hero**: Main hero section with couple names and wedding date

### Optional Sections
- **Couple**: Introduction with photos and family details
- **Father's Letter**: Heartfelt message from parents
- **Gallery**: Photo gallery showcasing memories
- **Events**: Wedding events schedule with timings
- **Venue**: Venue details with interactive map
- **RSVP**: Guest response section
- **Footer**: Additional information and credits

## Themes

### 1. Royal Gold (Default)
- Primary: Gold (#d4af37)
- Background: Cream (#fff8f0)
- Perfect for: Traditional, luxurious weddings

### 2. Rose Blush
- Primary: Rose (#c77d8a)
- Background: Soft pink (#fff5f7)
- Perfect for: Romantic, feminine celebrations

### 3. Sage Green
- Primary: Sage (#9bb69d)
- Background: Off-white (#f9faf8)
- Perfect for: Natural, outdoor weddings

### 4. Navy Elegance
- Primary: Navy (#2c3e50)
- Background: Light gray (#f8f9fa)
- Perfect for: Modern, sophisticated events

## Features

- ✅ Multi-language support (English, Hindi, Telugu)
- ✅ Fully responsive design
- ✅ Smooth animations and transitions
- ✅ PWA capabilities
- ✅ Theme customization
- ✅ Section reordering
- ✅ WYSIWYG editing
- ✅ Export to static HTML

## Components

### View Components
Located in `components/view/`:
- `Hero.jsx` - Main hero section
- `Couple.jsx` - Couple introduction
- `FathersLetter.jsx` - Parent's message
- `Gallery.jsx` - Photo gallery
- `Events.jsx` - Events schedule
- `Venue.jsx` - Venue information
- `RSVP.jsx` - RSVP section
- `Footer.jsx` - Footer content
- `Header.jsx` - Page header
- `Blessings.jsx` - Blessing overlay
- `ConfettiLayer.jsx` - Confetti animation
- `CelebrateButton.jsx` - Celebration button

### Editable Components
Located in `components/editable/`:
- `EditableHeroSection.jsx`
- `EditableCoupleSection.jsx`
- `EditableFathersLetterSection.jsx`
- `EditableGallerySection.jsx`
- `EditableEventsSection.jsx`
- `EditableVenueSection.jsx`
- `EditableRSVPSection.jsx`
- `EditableFooter.jsx`

### Shared Components
Located in `components/shared/`:
- `EditableText.jsx` - Inline text editor
- `EditableImage.jsx` - Image uploader/editor
- `EditableWrapper.jsx` - Wrapper for editable content
- `RSVPModal.jsx` - RSVP submission modal
- `LanguageModal.jsx` - Language selection modal
- `GuestNameModal.jsx` - Guest name input modal

## Export

The layout includes a comprehensive export system that generates:
- Standalone HTML file with embedded content
- CSS stylesheets matching the theme
- PWA manifest for progressive web app functionality
- All necessary assets bundled in a ZIP file

The export ensures that the final invitation matches exactly what was built in the builder.

## Usage

### Registering the Layout

The layout is automatically registered when imported:

```javascript
import { registerLayout } from '../registry';
import classicScrollLayout from './classic-scroll';

// Layout is registered on import
```

### Using in Builder

The builder automatically loads the layout based on the invitation's `layoutId`:

```javascript
const invitation = {
  id: '123',
  layoutId: 'classic-scroll',
  data: { /* content data */ },
  layoutConfig: { /* layout configuration */ }
};
```

### Exporting

Export uses the layout's export template:

```javascript
import { exportInvitationAsZip } from '../services/exportService';

await exportInvitationAsZip(invitation);
// Generates ZIP with complete static site
```

## Development

### Adding New Components

1. Create component in `components/view/` or `components/editable/`
2. Export from `components/index.js`
3. Register in layout's component mapping
4. Update manifest if it's a new section type

### Modifying Styles

1. Edit styles in `styles/` directory
2. Ensure styles are scoped to layout
3. Update export styles generator if needed

### Testing

```bash
# Run component tests
npm test -- classic-scroll/tests/components

# Run export tests
npm test -- classic-scroll/tests/export

# Run integration tests
npm test -- classic-scroll/tests/integration
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for mobile devices
- Lazy loading for images
- Minimal JavaScript bundle
- CSS optimizations

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast theme option

## License

Part of Sacred Vows Wedding Invitation Builder
ISC License

