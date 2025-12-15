/**
 * Layout Registry System
 * 
 * Central registry for managing layout definitions, components, styles, and export templates.
 * Each layout must register itself with this registry to be available in the builder.
 * 
 * Architecture:
 * - Layouts are self-contained with their own components, styles, and export logic
 * - Registry provides a unified API for accessing layout resources
 * - Supports dynamic layout loading and validation
 */

// Registry storage
const layouts = new Map();

/**
 * Layout registration schema
 * @typedef {Object} LayoutRegistration
 * @property {string} id - Unique layout identifier (e.g., 'classic-scroll')
 * @property {string} name - Display name
 * @property {string} version - Semantic version
 * @property {Object} components - Component mappings
 * @property {Object} components.view - View-only components by section ID
 * @property {Object} components.editable - Editable components by section ID
 * @property {Object} components.shared - Shared components (modals, utilities)
 * @property {Function} styles - Function that applies layout styles
 * @property {Object} export - Export template functions
 * @property {Function} export.generateHTML - Generate HTML for export
 * @property {Function} export.generateCSS - Generate CSS for export
 * @property {Object} manifest - Layout manifest (sections, themes, metadata)
 * @property {Object} hooks - Layout-specific hooks
 */

/**
 * Register a layout in the registry
 * @param {LayoutRegistration} layout - Layout definition
 * @throws {Error} If layout is invalid or already registered
 */
export function registerLayout(layout) {
  // Validate layout structure
  if (!layout.id) {
    throw new Error('Layout must have an id');
  }
  
  if (layouts.has(layout.id)) {
    console.warn(`Layout '${layout.id}' is already registered. Overwriting.`);
  }
  
  if (!layout.name) {
    throw new Error(`Layout '${layout.id}' must have a name`);
  }
  
  if (!layout.version) {
    throw new Error(`Layout '${layout.id}' must have a version`);
  }
  
  if (!layout.components || !layout.components.view || !layout.components.editable) {
    throw new Error(`Layout '${layout.id}' must provide view and editable components`);
  }
  
  if (!layout.export || !layout.export.generateHTML) {
    throw new Error(`Layout '${layout.id}' must provide export.generateHTML function`);
  }
  
  if (!layout.manifest) {
    throw new Error(`Layout '${layout.id}' must provide a manifest`);
  }
  
  // Register the layout
  layouts.set(layout.id, {
    ...layout,
    registeredAt: new Date().toISOString(),
  });
  
  console.log(`✓ Registered layout: ${layout.id} (v${layout.version})`);
  
  return layout;
}

/**
 * Unregister a layout from the registry
 * @param {string} layoutId - Layout identifier
 * @returns {boolean} True if layout was unregistered
 */
export function unregisterLayout(layoutId) {
  return layouts.delete(layoutId);
}

/**
 * Get a layout by ID
 * @param {string} layoutId - Layout identifier
 * @returns {LayoutRegistration|null} Layout definition or null if not found
 */
export function getLayout(layoutId) {
  return layouts.get(layoutId) || null;
}

/**
 * Get all registered layouts
 * @returns {LayoutRegistration[]} Array of all registered layouts
 */
export function getAllLayouts() {
  return Array.from(layouts.values());
}

/**
 * Get layout IDs
 * @returns {string[]} Array of layout IDs
 */
export function getLayoutIds() {
  return Array.from(layouts.keys());
}

/**
 * Check if a layout is registered
 * @param {string} layoutId - Layout identifier
 * @returns {boolean} True if layout is registered
 */
export function hasLayout(layoutId) {
  return layouts.has(layoutId);
}

/**
 * Get view components for a layout
 * @param {string} layoutId - Layout identifier
 * @returns {Object} View components by section ID
 * @throws {Error} If layout not found
 */
export function getViewComponents(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.view;
}

/**
 * Get editable components for a layout
 * @param {string} layoutId - Layout identifier
 * @returns {Object} Editable components by section ID
 * @throws {Error} If layout not found
 */
export function getEditableComponents(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.editable;
}

/**
 * Get shared components for a layout
 * @param {string} layoutId - Layout identifier
 * @returns {Object} Shared components
 * @throws {Error} If layout not found
 */
export function getSharedComponents(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.shared || {};
}

/**
 * Get component registry for a layout (all components organized by type)
 * @param {string} layoutId - Layout identifier
 * @param {boolean} editMode - Whether in edit mode
 * @returns {Object} Component mappings by section ID
 */
export function getComponentRegistry(layoutId, editMode = false) {
  const components = editMode 
    ? getEditableComponents(layoutId) 
    : getViewComponents(layoutId);
  
  return components;
}

/**
 * Get layout manifest
 * @param {string} layoutId - Layout identifier
 * @returns {Object} Layout manifest
 * @throws {Error} If layout not found
 */
export function getLayoutManifest(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.manifest;
}

/**
 * Get export functions for a layout
 * @param {string} layoutId - Layout identifier
 * @returns {Object} Export functions
 * @throws {Error} If layout not found
 */
export function getLayoutExport(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.export;
}

/**
 * Get layout hooks
 * @param {string} layoutId - Layout identifier
 * @returns {Object} Layout-specific hooks
 */
export function getLayoutHooks(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.hooks || {};
}

/**
 * Apply layout styles
 * @param {string} layoutId - Layout identifier
 * @throws {Error} If layout not found
 */
export function applyLayoutStyles(layoutId) {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  if (layout.styles && typeof layout.styles === 'function') {
    layout.styles();
  }
}

/**
 * Clear all registered layouts (useful for testing)
 */
export function clearRegistry() {
  layouts.clear();
}

/**
 * Get registry statistics
 * @returns {Object} Registry stats
 */
export function getRegistryStats() {
  return {
    totalLayouts: layouts.size,
    layoutIds: getLayoutIds(),
    layouts: getAllLayouts().map(l => ({
      id: l.id,
      name: l.name,
      version: l.version,
      registeredAt: l.registeredAt,
    })),
  };
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.__layoutRegistry = {
    getStats: getRegistryStats,
    getLayout,
    getAllLayouts,
  };
}

