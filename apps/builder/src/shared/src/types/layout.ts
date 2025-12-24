/**
 * Layout Configuration Schema
 * Defines the structure for layout metadata and configuration
 */

export interface LayoutMetadata {
  name: string;
  description: string;
  previewImage: string;
  tags: string[];
  author: string;
  version: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentSoft?: string;
  muted?: string;
  background: {
    page: string;
    section?: string;
    card?: string;
    raised?: string;
    overlay?: string;
  };
  text: {
    primary: string;
    muted?: string;
    accent?: string;
    onPrimary?: string;
    onAccent?: string;
  };
  states?: {
    hover?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    active?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    focus?: {
      ring?: string;
    };
    disabled?: {
      background?: string;
      text?: string;
      border?: string;
    };
  };
  gradients?: {
    hero?: {
      start: string;
      end: string;
      angle?: string;
    };
    cta?: {
      start: string;
      end: string;
      angle?: string;
    };
  };
  overlays?: {
    imageVeil?: string;
    card?: string;
    modal?: string;
  };
  elevation?: {
    flat?: string;
    card?: string;
    popover?: string;
    modal?: string;
  };
  radii?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    pill?: string;
  };
  borders?: {
    soft?: {
      color: string;
      width: string;
      style?: string;
    };
    strong?: {
      color: string;
      width: string;
      style?: string;
    };
    divider?: {
      color: string;
      width: string;
      style?: string;
    };
    dashed?: {
      color: string;
      width: string;
      style?: string;
    };
  };
  spacing?: {
    scale?: Record<string, string>;
    section?: Record<string, string>;
    gaps?: Record<string, string>;
  };
  layout?: {
    container?: Record<string, unknown>;
    breakpoints?: Record<string, unknown>;
    grid?: Record<string, unknown>;
  };
  typography?: {
    family?: Record<string, string>;
    weights?: Record<string, string>;
    sizes?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacing?: Record<string, string>;
    decorations?: Record<string, string>;
  };
  links?: Record<string, unknown>;
  buttons?: Record<string, unknown>;
  forms?: Record<string, unknown>;
  chips?: Record<string, unknown>;
  cards?: Record<string, unknown>;
  dividers?: Record<string, unknown>;
  lists?: Record<string, unknown>;
  icons?: Record<string, unknown>;
  imagery?: Record<string, unknown>;
  illustrations?: Record<string, unknown>;
  motion?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  cta?: Record<string, unknown>;
  shell?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
}

export interface ThemeConfig {
  preset: string;
  colors: ThemeColors;
  fonts?: {
    heading: string;
    body: string;
    script?: string;
  };
}

export interface SectionConfig {
  id: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  order?: number;
}

export interface LayoutManifest {
  id: string;
  name: string;
  version: string;
  metadata: LayoutMetadata;
  sections: Array<{
    id: string;
    name: string;
    required?: boolean;
    order?: number;
    [key: string]: unknown;
  }>;
  themes?: Array<{
    id: string;
    name: string;
    isDefault?: boolean;
    colors: ThemeColors;
    fonts?: {
      heading: string;
      body: string;
      script?: string;
    };
  }>;
  defaultSectionOrder?: string[];
  [key: string]: unknown;
}

export interface LayoutConfig {
  id: string;
  name: string;
  version: string;
  metadata: LayoutMetadata;
  sections: SectionConfig[];
  theme: ThemeConfig;
}

export const LayoutConfigSchema = {
  // Schema validation can be added here
};
