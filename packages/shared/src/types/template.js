/**
 * Template Configuration Schema
 * Defines the structure for template metadata and configuration
 */

/**
 * @typedef {Object} TemplateMetadata
 * @property {string} name - Template display name
 * @property {string} description - Template description
 * @property {string} previewImage - URL to preview image
 * @property {string[]} tags - Template tags for categorization
 * @property {string} author - Template author
 * @property {string} version - Template version
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {Object} colors - Color palette
 * @property {string} colors.primary - Primary color
 * @property {string} colors.secondary - Secondary color
 * @property {string} colors.background - Background color
 * @property {string} colors.text - Text color
 * @property {Object} fonts - Font configuration
 * @property {string} fonts.heading - Heading font family
 * @property {string} fonts.body - Body font family
 * @property {string} fonts.script - Script/decorative font family
 */

/**
 * @typedef {Object} SectionConfig
 * @property {string} id - Section identifier
 * @property {boolean} enabled - Whether section is enabled
 * @property {Object} config - Section-specific configuration
 */

/**
 * @typedef {Object} TemplateConfig
 * @property {string} id - Unique template identifier
 * @property {string} name - Template name
 * @property {string} version - Template version
 * @property {TemplateMetadata} metadata - Template metadata
 * @property {SectionConfig[]} sections - Section configurations
 * @property {ThemeConfig} theme - Theme configuration
 */

export const TemplateConfigSchema = {
  // Schema validation can be added here
};

