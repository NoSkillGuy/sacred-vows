# Layout Development Guide

This guide provides step-by-step instructions for creating a new layout for the Wedding Invitation Builder.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Planning Your Layout](#planning-your-layout)
3. [Creating the Layout Structure](#creating-the-layout-structure)
4. [Implementing Components](#implementing-components)
5. [Defining the Manifest](#defining-the-manifest)
6. [Creating Export Templates](#creating-export-templates)
7. [Registering the Layout](#registering-the-layout)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Publishing](#publishing)

## Prerequisites

Before creating a new layout, ensure you:
- Understand React and modern JavaScript (ES6+)
- Are familiar with the builder's data structure (see `shared/src/types/wedding-data.js`)
- Have read the [Layout System README](README.md)
- Have reviewed the `classic-scroll` layout implementation

## Planning Your Layout

### 1. Define Your Layout Concept

Answer these questions:
- What wedding style does this layout suit? (traditional, modern, minimalist, etc.)
- What makes this layout unique?
- What sections will it include?
- Will it be single-page or multi-page?
- What viewport sizes will it support?

### 2. Design Specifications

Create:
- Wireframes for desktop and mobile
- Color palette and typography choices
- Section ordering and interactions
- Theme variations

### 3. Choose a Layout ID

Pick a unique, descriptive ID using kebab-case:
- ✅ Good: `modern-minimalist`, `bohemian-floral`, `art-deco-gatsby`
- ❌ Bad: `Layout2`, `myLayout`, `new_layout`

## Creating the Layout Structure

### Step 1: Create Directory

```bash
cd apps/builder/src/layouts
mkdir your-layout-name
cd your-layout-name
```

### Step 2: Create Subdirectories

```bash
mkdir -p components/{view,editable,shared}
mkdir -p styles
mkdir -p hooks
mkdir -p export
mkdir -p tests/{components,export,integration}
```

### Step 3: Create Base Files

Create these files:
- `index.js` - Main registration file
- `manifest.js` - Layout manifest
- `README.md` - Layout documentation
- `components/index.js` - Component exports
- `styles/index.js` - Style exports
- `hooks/index.js` - Hook exports
- `export/index.js` - Export logic

## Implementing Components

### View Components

Create read-only components for displaying the invitation:

**Example: `components/view/Hero.jsx`**

```javascript
import React from 'react';

function Hero({ config, translations, currentLang, onRSVPClick }) {
  const { branding, couple } = config;
  const t = translations || {};
  
  return (
    <section className="hero-section">
      <h1 className="hero-title">
        {couple?.bride?.name || 'Bride'} & {couple?.groom?.name || 'Groom'}
      </h1>
      <p className="hero-date">
        {config.wedding?.dates?.[0] || 'Date TBD'}
      </p>
      {onRSVPClick && (
        <button className="hero-rsvp-btn" onClick={onRSVPClick}>
          {t.rsvp || 'RSVP'}
        </button>
      )}
    </section>
  );
}

export default Hero;
```

**Best Practices**:
- Handle missing data gracefully with fallbacks
- Support multi-language via translations prop
- Keep components pure and functional
- Use semantic HTML
- Add accessibility attributes

### Editable Components

Create WYSIWYG editable versions:

**Example: `components/editable/EditableHeroSection.jsx`**

```javascript
import React from 'react';
import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';

function EditableHeroSection({ config, translations, currentLang, onUpdate, onRSVPClick }) {
  const { branding, couple } = config;
  
  const handleUpdate = (path, value) => {
    onUpdate(path, value);
  };
  
  return (
    <section className="hero-section" data-editable>
      <EditableText
        value={couple?.bride?.name || 'Bride'}
        onSave={(value) => handleUpdate('couple.bride.name', value)}
        placeholder="Bride's Name"
        className="hero-bride-name"
      />
      <span className="hero-ampersand">&</span>
      <EditableText
        value={couple?.groom?.name || 'Groom'}
        onSave={(value) => handleUpdate('couple.groom.name', value)}
        placeholder="Groom's Name"
        className="hero-groom-name"
      />
      {/* More editable fields */}
    </section>
  );
}

export default EditableHeroSection;
```

**Best Practices**:
- Use EditableText and EditableImage wrappers
- Call onUpdate with the data path and new value
- Provide meaningful placeholders
- Add visual editing indicators

### Shared Components

Create reusable components:
- Modals (RSVP, Language, Guest Name)
- Editable utilities (EditableText, EditableImage)
- Common UI elements

### Component Organization

Update `components/index.js`:

```javascript
// Import all components
import Hero from './view/Hero';
import Couple from './view/Couple';
// ... more imports

import EditableHeroSection from './editable/EditableHeroSection';
// ... more imports

// Export organized by type
export const viewComponents = {
  hero: Hero,
  couple: Couple,
  // ... map section IDs to components
};

export const editableComponents = {
  hero: EditableHeroSection,
  couple: EditableCoupleSection,
  // ...
};

export const sharedComponents = {
  // Modals, utilities, etc.
};

export default {
  view: viewComponents,
  editable: editableComponents,
  shared: sharedComponents,
};
```

## Defining the Manifest

Create `manifest.js`:

```javascript
export const yourLayoutManifest = {
  id: 'your-layout-name',
  name: 'Your Layout Name',
  version: '1.0.0',
  
  metadata: {
    description: 'Brief description of your layout',
    previewImage: '/layouts/your-layout-name/preview.jpg',
    tags: ['tag1', 'tag2', 'tag3'],
    author: 'Your Name or Company',
    category: 'Traditional|Modern|Minimalist|etc',
    featured: false,
    status: 'ready', // 'ready' | 'coming-soon' | 'hidden'
  },
  
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      icon: '💑',
      description: 'Main hero section',
      required: true,
      enabled: true,
      order: 0,
      config: {},
    },
    // Define all sections
  ],
  
  themes: [
    {
      id: 'default-theme',
      name: 'Default Theme',
      isDefault: true,
      colors: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        text: '#333333',
        accent: '#999999',
      },
      fonts: {
        heading: 'Serif Font',
        body: 'Sans Font',
        script: 'Script Font',
      },
    },
    // Add more theme variations
  ],
  
  features: {
    multiLanguage: true,
    responsiveDesign: true,
    darkMode: false,
    animations: true,
    pwa: true,
    offlineSupport: false,
  },
  
  requirements: {
    minScreenWidth: 320,
    recommendedScreenWidth: 375,
    supportedBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
  },
};

export default yourLayoutManifest;
```

## Creating Export Templates

### HTML Generation

Create `export/template.js`:

```javascript
export async function generateHTML(invitation, translations) {
  const { data, layoutConfig } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};
  
  // Extract data
  const couple = data?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  
  // Generate theme CSS variables
  const themeStyles = `
    :root {
      --primary: ${colors.primary || '#000'};
      --secondary: ${colors.secondary || '#666'};
      --background: ${colors.background || '#fff'};
      --text: ${colors.text || '#333'};
      --font-heading: ${fonts.heading || 'serif'};
      --font-body: ${fonts.body || 'sans-serif'};
    }
  `;
  
  // Generate HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${bride.name || 'Bride'} & ${groom.name || 'Groom'} - Wedding</title>
  <link rel="manifest" href="./manifest.json" />
  <link rel="stylesheet" href="styles.css" />
  <style>${themeStyles}</style>
</head>
<body>
  <div id="root">
    <!-- Your layout HTML structure -->
    <header>
      <h1>${bride.name} & ${groom.name}</h1>
    </header>
    <!-- More sections -->
  </div>
  <script src="app.js"></script>
</body>
</html>`;
}

export default generateHTML;
```

### CSS Generation

Create `export/styles.js`:

```javascript
export async function generateCSS(invitation) {
  const { layoutConfig, data } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  return `
    /* Your Layout Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-body), sans-serif;
      background: var(--background);
      color: var(--text);
    }

    /* Add all your layout styles */
  `;
}

export default generateCSS;
```

## Registering the Layout

Create `index.js`:

```javascript
import { registerLayout } from '../registry';
import yourLayoutManifest from './manifest';
import components from './components';
import styles from './styles';
import exportModule from './export';
import hooks from './hooks';

const yourLayout = {
  id: 'your-layout-name',
  name: 'Your Layout Name',
  version: '1.0.0',
  
  components: {
    view: components.view,
    editable: components.editable,
    shared: components.shared,
  },
  
  styles: styles.apply,
  
  export: {
    generateHTML: exportModule.generateHTML,
    generateCSS: exportModule.generateCSS,
  },
  
  manifest: yourLayoutManifest,
  
  hooks: hooks,
};

// Register on import
try {
  registerLayout(yourLayout);
} catch (error) {
  console.error('Failed to register layout:', error);
}

export default yourLayout;
```

## Testing

### Unit Tests

Test each component:

```javascript
// tests/components/Hero.test.jsx
import { render, screen } from '@testing-library/react';
import Hero from '../../components/view/Hero';

describe('Hero Component', () => {
  it('renders bride and groom names', () => {
    const config = {
      couple: {
        bride: { name: 'Jane' },
        groom: { name: 'John' },
      },
    };
    
    render(<Hero config={config} />);
    expect(screen.getByText(/Jane/)).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });
});
```

### Export Tests

Test HTML/CSS generation:

```javascript
// tests/export/template.test.js
import { generateHTML } from '../../export/template';

describe('Export Template', () => {
  it('generates valid HTML', async () => {
    const invitation = {
      layoutId: 'your-layout-name',
      data: { /* test data */ },
      layoutConfig: { /* test config */ },
    };
    
    const html = await generateHTML(invitation, {});
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });
});
```

### Integration Tests

Test full workflow:
- Load layout in builder
- Edit sections
- Export invitation
- Verify exported HTML matches builder

## Documentation

Create comprehensive `README.md` covering:
- Layout overview and description
- Features and capabilities
- Section descriptions
- Theme options
- Usage instructions
- Browser support
- Performance characteristics
- Accessibility features

## Publishing

### Checklist

Before merging your layout:

- [ ] All components implemented and tested
- [ ] Manifest complete and accurate
- [ ] Export generates valid HTML/CSS
- [ ] README.md comprehensive
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (WCAG 2.1 AA)
- [ ] No console errors or warnings
- [ ] Preview image created
- [ ] Code reviewed

### Deployment

1. Create a pull request
2. Request code review
3. Address feedback
4. Merge to main
5. Layout automatically available in production

## Tips and Best Practices

1. **Start Simple**: Begin with basic structure, add complexity gradually
2. **Follow Patterns**: Study `classic-scroll` for examples
3. **Test Early**: Write tests as you build components
4. **Document Everything**: Future you will thank present you
5. **Performance Matters**: Optimize images, minimize CSS/JS
6. **Accessibility First**: Use semantic HTML, ARIA labels, keyboard navigation
7. **Mobile First**: Design for smallest screen, enhance for larger
8. **Theme Flexibility**: Support multiple color schemes
9. **Graceful Degradation**: Handle missing data elegantly
10. **User Feedback**: Test with real users, iterate based on feedback

## Support

Need help? Check:
- [Layout System README](README.md)
- [Classic Scroll Implementation](classic-scroll/)
- Main project documentation

## License

Part of Sacred Vows Wedding Invitation Builder
ISC License

