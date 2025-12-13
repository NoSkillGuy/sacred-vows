/**
 * Layout Configuration Schema
 * Defines the structure for layout metadata and configuration
 */

/**
 * @typedef {Object} LayoutMetadata
 * @property {string} name - Layout display name
 * @property {string} description - Layout description
 * @property {string} previewImage - URL to preview image
 * @property {string[]} tags - Layout tags for categorization
 * @property {string} author - Layout author
 * @property {string} version - Layout version
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} preset - Theme identifier/preset name
 * @property {Object} colors - Core color palette
 * @property {string} colors.primary
 * @property {string} colors.secondary
 * @property {string} colors.accent
 * @property {string} colors.accentSoft
 * @property {string} colors.muted
 * @property {{page:string, section?:string, card?:string, raised?:string, overlay?:string}} colors.background
 * @property {{primary:string, muted?:string, accent?:string, onPrimary?:string, onAccent?:string}} colors.text
 * @property {Object} states - State tokens
 * @property {{primary?:string, secondary?:string, accent?:string}} states.hover
 * @property {{primary?:string, secondary?:string, accent?:string}} states.active
 * @property {{ring?:string}} states.focus
 * @property {{background?:string, text?:string, border?:string}} states.disabled
 * @property {Object} gradients - Gradient definitions
 * @property {{start:string,end:string,angle?:string}} gradients.hero
 * @property {{start:string,end:string,angle?:string}} gradients.cta
 * @property {Object} overlays - Overlays for imagery/modals
 * @property {string} overlays.imageVeil
 * @property {string} overlays.card
 * @property {string} overlays.modal
 * @property {Object} elevation - Shadow levels
 * @property {string} elevation.flat
 * @property {string} elevation.card
 * @property {string} elevation.popover
 * @property {string} elevation.modal
 * @property {Object} radii - Border radius scale
 * @property {string} radii.xs
 * @property {string} radii.sm
 * @property {string} radii.md
 * @property {string} radii.lg
 * @property {string} radii.xl
 * @property {string} radii.pill
 * @property {Object} borders - Border styles
 * @property {{color:string,width:string,style?:string}} borders.soft
 * @property {{color:string,width:string,style?:string}} borders.strong
 * @property {{color:string,width:string,style?:string}} borders.divider
 * @property {{color:string,width:string,style?:string}} borders.dashed
 * @property {Object} spacing - Spacing scale and presets
 * @property {Object} spacing.scale
 * @property {Object} spacing.section
 * @property {Object} spacing.gaps
 * @property {Object} layout - Layout, breakpoints, grid
 * @property {Object} layout.container
 * @property {Object} layout.breakpoints
 * @property {Object} layout.grid
 * @property {Object} typography - Typography families, sizes, weights
 * @property {Object} typography.family
 * @property {Object} typography.weights
 * @property {Object} typography.sizes
 * @property {Object} typography.lineHeights
 * @property {Object} typography.letterSpacing
 * @property {Object} typography.decorations
 * @property {Object} links - Link styles
 * @property {Object} buttons - Button variants
 * @property {Object} forms - Form colors and focus rings
 * @property {Object} chips - Chip/badge styles
 * @property {Object} cards - Card surfaces/shadows
 * @property {Object} dividers - Divider colors/thickness
 * @property {Object} lists - List bullet/icon settings
 * @property {Object} icons - Iconography defaults
 * @property {Object} imagery - Photo treatments
 * @property {Object} illustrations - Illustration palette/preferences
 * @property {Object} motion - Durations, easing, offsets
 * @property {Object} sections - Section-specific layout presets
 * @property {Object} cta - Call-to-action layout options
 * @property {Object} shell - Header/footer/social hooks
 * @property {Object} accessibility - Focus ring/contrast/tap-size guidance
 */

/**
 * @typedef {Object} SectionConfig
 * @property {string} id - Section identifier
 * @property {boolean} enabled - Whether section is enabled
 * @property {Object} config - Section-specific configuration
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {string} id - Unique layout identifier
 * @property {string} name - Layout name
 * @property {string} version - Layout version
 * @property {LayoutMetadata} metadata - Layout metadata
 * @property {SectionConfig[]} sections - Section configurations
 * @property {ThemeConfig} theme - Theme configuration
 */

export const LayoutConfigSchema = {
  // Schema validation can be added here
};
