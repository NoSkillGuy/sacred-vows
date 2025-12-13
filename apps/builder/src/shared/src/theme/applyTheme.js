/**
 * Brand kit theme helpers
 * - merges legacy/simple themes into an expanded brand-kit contract
 * - produces CSS variables consumed by the invitation styles
 * - applies the variables to documentElement when available
 */

const DEFAULT_BRAND_KIT_THEME = {
  preset: 'heritage-red',
  colors: {
    primary: '#b21f2d',
    secondary: '#8c0f1f',
    accent: '#d4af37',
    accentSoft: '#f5d48a',
    muted: '#f3d6c8',
    background: {
      page: '#fff7f2',
      section: '#fff3eb',
      card: '#fff0e6',
      raised: '#fbead9',
      overlay: 'rgba(178, 31, 45, 0.06)',
    },
    text: {
      primary: '#2b0b0f',
      muted: '#5a2c32',
      accent: '#b21f2d',
      onPrimary: '#ffffff',
      onAccent: '#2b0b0f',
    },
  },
  states: {
    hover: { primary: '#991a27', secondary: '#73101b', accent: '#c79823' },
    active: { primary: '#7d1220', secondary: '#5c0c16', accent: '#a0781c' },
    focus: { ring: '0 0 0 3px rgba(178, 31, 45, 0.32)' },
    disabled: { background: '#f1d8d7', text: '#9a7b7f', border: '#d7b3b0' },
  },
  gradients: {
    hero: { start: 'rgba(178, 31, 45, 0.14)', end: 'rgba(140, 15, 31, 0.16)', angle: '120deg' },
    cta: { start: 'rgba(212, 175, 55, 0.18)', end: 'rgba(178, 31, 45, 0.12)', angle: '60deg' },
  },
  overlays: {
    imageVeil: 'rgba(178, 31, 45, 0.35)',
    card: 'rgba(255, 247, 242, 0.9)',
    modal: 'rgba(0, 0, 0, 0.32)',
  },
  elevation: {
    flat: '0 1px 3px rgba(0, 0, 0, 0.08)',
    card: '0 18px 40px rgba(0, 0, 0, 0.07)',
    popover: '0 22px 50px rgba(0, 0, 0, 0.12)',
    modal: '0 26px 80px rgba(0, 0, 0, 0.18)',
  },
  radii: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '28px', pill: '999px' },
  borders: {
    soft: { color: 'rgba(212, 175, 55, 0.35)', width: '1px', style: 'solid' },
    strong: { color: 'rgba(178, 31, 45, 0.4)', width: '2px', style: 'solid' },
    divider: { color: 'rgba(178, 31, 45, 0.12)', width: '1px', style: 'solid' },
    dashed: { color: 'rgba(212, 175, 55, 0.55)', width: '1px', style: 'dashed' },
  },
  spacing: {
    scale: {
      xxs: '4px',
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    section: {
      y: { mobile: '50px', desktop: '80px' },
      x: { mobile: '12px', desktop: '24px' },
    },
    gaps: { cards: '18px', grid: '20px' },
  },
  layout: {
    container: { maxWidth: '1100px', narrowWidth: '880px', padding: { mobile: '12px', desktop: '24px' } },
    breakpoints: { xs: '360px', sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
    grid: { columns: { mobile: 6, desktop: 12 }, gutters: { mobile: '12px', desktop: '20px' } },
  },
  typography: {
    family: { heading: 'Playfair Display', body: 'Poppins', script: 'Great Vibes' },
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    sizes: {
      display: '48px',
      h1: '40px',
      h2: '32px',
      h3: '28px',
      h4: '24px',
      h5: '20px',
      h6: '18px',
      lead: '18px',
      body: '16px',
      small: '14px',
      meta: '12px',
    },
    lineHeights: { display: 1.1, heading: 1.2, body: 1.6, tight: 1.3 },
    letterSpacing: { caps: '0.12em', body: '0.01em', tight: '-0.01em' },
    decorations: { underlineOffset: '2px', linkDecoration: 'underline' },
  },
  links: { color: '#b21f2d', hoverColor: '#8c0f1f', visitedColor: '#701018', decoration: 'underline', hoverDecoration: 'underline' },
  buttons: {
    primary: {
      background: '#b21f2d',
      text: '#ffffff',
      border: '#b21f2d',
      hoverBackground: '#991a27',
      shadow: '0 12px 30px rgba(178, 31, 45, 0.28)',
    },
    ghost: {
      background: 'transparent',
      text: '#b21f2d',
      border: 'rgba(178, 31, 45, 0.28)',
      hoverBackground: 'rgba(178, 31, 45, 0.08)',
    },
    outline: {
      background: '#fff7f2',
      text: '#8c0f1f',
      border: '#d4af37',
      hoverBackground: 'rgba(212, 175, 55, 0.08)',
    },
    subtle: {
      background: '#fff0e6',
      text: '#2b0b0f',
      border: 'rgba(178, 31, 45, 0.12)',
      hoverBackground: '#fbead9',
    },
  },
  forms: {
    background: '#fffdfb',
    border: 'rgba(178, 31, 45, 0.18)',
    focus: { ring: '0 0 0 3px rgba(178, 31, 45, 0.25)', border: '#b21f2d' },
    text: '#2b0b0f',
    placeholder: '#8c6a72',
    success: { border: '#3f9c53', background: 'rgba(63, 156, 83, 0.08)' },
    error: { border: '#c02b2b', background: 'rgba(192, 43, 43, 0.08)' },
  },
  chips: {
    fill: { background: 'rgba(178, 31, 45, 0.12)', text: '#8c0f1f' },
    outline: { border: 'rgba(178, 31, 45, 0.35)', text: '#2b0b0f' },
    radius: '999px',
    gap: '8px',
  },
  cards: {
    surface: '#fff7f2',
    shadow: '0 20px 40px rgba(0, 0, 0, 0.07)',
    radius: '24px',
    padding: { dense: '16px', default: '20px', relaxed: '24px' },
  },
  dividers: {
    color: 'rgba(212, 175, 55, 0.45)',
    thickness: '1px',
    inset: '24px',
  },
  lists: {
    bullet: '•',
    iconBullet: '◆',
    color: '#b21f2d',
  },
  icons: { stroke: '1.5px', corner: 'rounded', size: '20px', color: '#b21f2d' },
  imagery: { tint: 'rgba(178, 31, 45, 0.12)', saturation: 1.05, vignette: 'rgba(0,0,0,0.14)', blur: '0px' },
  illustrations: { style: 'duotone', primaryColor: '#b21f2d', secondaryColor: '#d4af37', backgroundColor: '#fff7f2' },
  motion: {
    duration: { fast: '150ms', base: '220ms', slow: '320ms' },
    easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.2, 0, 0, 1)', out: 'cubic-bezier(0, 0, 0.2, 1)' },
    distance: { x: '12px', y: '16px' },
  },
  sections: {
    hero: { layout: 'two-column', padding: { mobile: '20px', desktop: '32px' }, accent: 'gradient' },
    story: { layout: 'split', padding: { mobile: '18px', desktop: '28px' } },
    events: { layout: 'timeline', padding: { mobile: '16px', desktop: '24px' } },
    gallery: { layout: 'masonry', padding: { mobile: '14px', desktop: '22px' } },
    rsvp: { layout: 'card', padding: { mobile: '18px', desktop: '26px' } },
  },
  cta: {
    layouts: { stacked: true, inline: true, iconPosition: 'end' },
    spacing: { mobile: '12px', desktop: '16px' },
  },
  shell: {
    header: { background: 'linear-gradient(to bottom, rgba(255,248,240,0.98), rgba(255,248,240,0.95))', divider: 'rgba(212, 175, 55, 0.18)' },
    footer: { background: '#fff7f2', divider: 'rgba(212, 175, 55, 0.25)' },
    social: { iconFill: '#b21f2d', iconBackground: 'rgba(178, 31, 45, 0.08)' },
  },
  accessibility: {
    focusRing: '0 0 0 3px rgba(178, 31, 45, 0.45)',
    contrastTarget: { text: '4.5:1', largeText: '3:1' },
    minTapSize: '44px',
  },
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

function normalizeThemeInput(theme = {}) {
  const normalized = { ...theme };

  if (normalized.colors?.text && typeof normalized.colors.text === 'string') {
    normalized.colors = {
      ...normalized.colors,
      text: { primary: normalized.colors.text },
    };
  }

  if (normalized.colors?.background && typeof normalized.colors.background === 'string') {
    normalized.colors = {
      ...normalized.colors,
      background: { page: normalized.colors.background },
    };
  }

  if (normalized.fonts && !normalized.typography?.family) {
    normalized.typography = {
      ...(normalized.typography || {}),
      family: { ...normalized.typography?.family, ...normalized.fonts },
    };
  }

  return normalized;
}

function mergeDeep(base = {}, override = {}) {
  const result = { ...base };

  Object.entries(override || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value.slice();
    } else if (isObject(value)) {
      result[key] = mergeDeep(base[key] || {}, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
}

function buildCSSVariables(theme) {
  const colors = theme.colors || {};
  const text = colors.text || {};
  const background = colors.background || {};
  const spacing = theme.spacing || {};
  const scale = spacing.scale || {};
  const layout = theme.layout || {};
  const container = layout.container || {};
  const radii = theme.radii || {};
  const elevation = theme.elevation || {};
  const buttons = theme.buttons || {};
  const forms = theme.forms || {};
  const states = theme.states || {};

  const primaryRgb = hexToRgb(colors.primary || '#b21f2d');
  const accentBlushRgb = hexToRgb(colors.muted || '#f6c1c7');
  const accentSageRgb = hexToRgb(colors.accentSoft || '#9bb69d');
  const buttonPrimaryRgb = hexToRgb(buttons.primary?.background || colors.primary || '#7c2831');

  return {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-accent-soft': colors.accentSoft,
    '--bg-page': background.page,
    '--bg-card': background.card || background.section,
    '--bg-card-deep': background.raised,
    '--border-gold': colors.accent,
    '--border-soft': theme.borders?.soft?.color,
    '--accent-gold': colors.accent,
    '--accent-gold-soft': colors.accentSoft,
    '--accent-rose': colors.primary,
    '--accent-blush': colors.muted,
    '--accent-sage': colors.secondary,
    '--text-main': text.primary,
    '--text-muted': text.muted,
    '--button-primary': buttons.primary?.background || colors.primary,
    '--button-primary-hover': buttons.primary?.hoverBackground || states.hover?.primary,
    '--shadow-soft': elevation.card,
    '--radius-large': radii.xl || radii.lg,
    '--radius-medium': radii.lg || radii.md,
    '--page-width': container.maxWidth,
    '--section-spacing': spacing.section?.y?.desktop || scale.xxl,
    '--accent-blush-rgb': accentBlushRgb,
    '--accent-sage-rgb': accentSageRgb,
    '--primary-rgb': primaryRgb,
    '--button-primary-rgb': buttonPrimaryRgb,
    '--link-color': theme.links?.color || colors.primary,
    '--link-hover': theme.links?.hoverColor || states.hover?.primary,
    '--form-border': forms.border,
    '--focus-ring': states.focus?.ring || theme.accessibility?.focusRing,
  };
}

function hexToRgb(hex) {
  if (!hex) return '';
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '';
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export function mergeBrandThemes(...themes) {
  return themes.reduce(
    (acc, theme) => mergeDeep(acc, normalizeThemeInput(theme)),
    { ...DEFAULT_BRAND_KIT_THEME },
  );
}

export function resolveBrandTheme(theme) {
  return mergeBrandThemes(theme || {});
}

export function themeVarsFromConfig(theme) {
  return buildCSSVariables(resolveBrandTheme(theme));
}

export function applyThemeToDocument(theme, target = typeof document !== 'undefined' ? document.documentElement : null) {
  const resolved = resolveBrandTheme(theme);
  const vars = buildCSSVariables(resolved);

  if (!target) {
    return resolved;
  }

  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      target.style.setProperty(key, value);
    }
  });

  return resolved;
}

export const defaultBrandKitTheme = DEFAULT_BRAND_KIT_THEME;

