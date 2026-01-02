# Wedding Invitation Builder - Layout System

## Overview

The layout system is a registry-based architecture that allows multiple wedding invitation layouts to coexist in the builder. Each layout is self-contained with its own components, styles, and export logic, ensuring that when users create and export an invitation, they get exactly what they built.

## Architecture

### Registry Pattern

The layout system uses a centralized registry (`registry.js`) where each layout registers itself with:
- **Components**: View and editable React components
- **Styles**: CSS stylesheets specific to the layout  
- **Export Templates**: Functions to generate static HTML/CSS for deployment
- **Manifest**: Metadata describing sections, themes, and features
- **Hooks**: Layout-specific React hooks

### Benefits

1. **Isolation**: Each layout is completely independent
2. **Export Accuracy**: Export uses the same components as the builder
3. **Scalability**: Easy to add new layouts without conflicts
4. **Maintainability**: Changes to one layout don't affect others
5. **Testability**: Each layout can be tested independently

## Directory Structure

```
layouts/
├── registry.js                    # Central layout registry
├── README.md                      # This file
├── LAYOUT_DEVELOPMENT_GUIDE.md    # Guide for creating new layouts
└── classic-scroll/                # Example layout
    ├── index.js                   # Layout registration
    ├── manifest.js                # Layout manifest
    ├── README.md                  # Layout documentation
    ├── components/
    │   ├── view/                  # View-only components
    │   ├── editable/              # WYSIWYG editable components
    │   ├── shared/                # Shared components
    │   └── index.js               # Component exports
    ├── styles/
    │   ├── main.css               # Main styles
    │   ├── EditableText.css       # Component styles
    │   ├── EditableImage.css
    │   └── index.js               # Style exports
    ├── hooks/
    │   ├── useEditable.js         # Layout hooks
    │   └── index.js
    ├── export/
    │   ├── template.js            # HTML generation
    │   ├── styles.js              # CSS generation
    │   └── index.js
    └── tests/
        ├── components/
        ├── export/
        └── integration/
```

## Available Layouts

### Classic Scroll
- **ID**: `classic-scroll`
- **Status**: Active
- **Description**: Traditional single-column vertical scroll layout
- **Best For**: Formal and traditional weddings
- **Documentation**: [layouts/classic-scroll/README.md](classic-scroll/README.md)

## Using Layouts

### In the Builder

The builder automatically loads layouts from the registry based on the invitation's `layoutId`:

```javascript
const invitation = {
  id: '123',
  layoutId: 'classic-scroll',
  data: { /* content data */ },
  layoutConfig: { /* layout configuration */ }
};
```

### Components

Components are dynamically loaded from the registry:

```javascript
import { getLayout, getViewComponents, getEditableComponents } from './registry';

const layoutId = 'classic-scroll';
const viewComponents = getViewComponents(layoutId);
const editableComponents = getEditableComponents(layoutId);
```

### Export

Export uses layout-specific templates:

```javascript
import { exportInvitationAsZip } from '../services/exportService';

await exportInvitationAsZip(invitation, translations);
// Automatically uses the layout's export template
```

## Creating a New Layout

See [LAYOUT_DEVELOPMENT_GUIDE.md](LAYOUT_DEVELOPMENT_GUIDE.md) for step-by-step instructions on creating a new layout.

### Quick Start

1. Create a new directory under `layouts/`
2. Copy the structure from `classic-scroll/`
3. Implement your components
4. Define your manifest
5. Register the layout in `index.js`
6. Test thoroughly

## Registry API

### Registration

```javascript
import { registerLayout } from './registry';

registerLayout({
  id: 'my-layout',
  name: 'My Layout',
  version: '1.0.0',
  components: { view, editable, shared },
  styles: applyStyles,
  export: { generateHTML, generateCSS },
  manifest: layoutManifest,
  hooks: { useEditable },
});
```

### Retrieval

```javascript
import {
  getLayout,
  getViewComponents,
  getEditableComponents,
  getLayoutManifest,
  getLayoutExport,
} from './registry';

const layout = getLayout('classic-scroll');
const components = getViewComponents('classic-scroll');
const manifest = getLayoutManifest('classic-scroll');
```

## Layout Manifest

Each layout provides a manifest describing its capabilities:

```javascript
{
  id: 'classic-scroll',
  name: 'Classic Scroll',
  version: '1.0.0',
  metadata: {
    description: '...',
    previewImage: '/layouts/classic-scroll/preview.jpg',
    tags: ['elegant', 'classic'],
    category: 'Traditional',
    status: 'ready',
  },
  sections: [
    { id: 'hero', name: 'Hero', required: true, enabled: true },
    { id: 'couple', name: 'Couple', required: false, enabled: true },
    // ...
  ],
  themes: [
    {
      id: 'royal-gold',
      name: 'Royal Gold',
      isDefault: true,
      colors: { primary: '#d4af37', ... },
      fonts: { heading: 'Playfair Display', ... },
    },
  ],
  features: {
    multiLanguage: true,
    responsiveDesign: true,
    animations: true,
  },
}
```

## Testing

Each layout should have comprehensive tests:

- **Unit Tests**: Test individual components
- **Export Tests**: Test HTML/CSS generation
- **Integration Tests**: Test full builder workflow

```bash
# Run tests for a specific layout
npm test -- layouts/classic-scroll/tests
```

## Best Practices

1. **Keep layouts self-contained**: All layout-specific code should be in the layout directory
2. **Follow naming conventions**: Use kebab-case for IDs, PascalCase for components
3. **Document thoroughly**: Update README.md with any changes
4. **Test comprehensively**: Write tests for all components and export logic
5. **Export accurately**: Ensure exported invitation matches builder preview
6. **Handle responsiveness**: Support mobile, tablet, and desktop viewports
7. **Optimize performance**: Lazy load images, minimize bundle size

## Troubleshooting

### Layout not found
- Ensure the layout is registered in `index.js`
- Check that the import statement loads the layout file

### Components not rendering
- Verify component paths in `components/index.js`
- Check that components are properly exported
- Ensure `SECTION_TYPES` match the manifest section IDs

### Export mismatch
- Verify export template uses the same components as the builder
- Check that styles are properly included in the export
- Test export locally before deploying

## Support

For questions or issues with the layout system:
1. Check the [LAYOUT_DEVELOPMENT_GUIDE.md](LAYOUT_DEVELOPMENT_GUIDE.md)
2. Review existing layout implementations (e.g., `classic-scroll`)
3. Consult the main project README

## License

Part of Sacred Vows Wedding Invitation Builder
ISC License

