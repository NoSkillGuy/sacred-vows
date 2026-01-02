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

import type { LayoutManifest } from "../types/layout";
import type { UniversalWeddingData, LayoutConfig } from "../types/wedding-data";
import type { ComponentType } from "react";

// Registry storage
const layouts = new Map<string, RegisteredLayout>();

/**
 * Layout component mappings
 */
export interface LayoutComponents {
  view: Record<string, ComponentType<Record<string, unknown>>>;
  editable: Record<string, ComponentType<Record<string, unknown>>>;
  shared?: Record<string, ComponentType<Record<string, unknown>>>;
}

/**
 * Layout export functions
 */
export interface LayoutExport {
  generateHTML: (
    data: UniversalWeddingData,
    config: LayoutConfig,
    translations?: Record<string, unknown>
  ) => string;
  generateCSS?: (data: UniversalWeddingData, config: LayoutConfig) => string;
  exportInvitation?: (
    data: UniversalWeddingData,
    config: LayoutConfig,
    translations?: Record<string, unknown>
  ) => Promise<Blob>;
  [key: string]: unknown;
}

/**
 * Layout hooks
 */
export interface LayoutHooks {
  [key: string]: (...args: unknown[]) => unknown;
}

/**
 * Layout registration schema
 */
export interface LayoutRegistration {
  id: string;
  name: string;
  version: string;
  components: LayoutComponents;
  styles?: () => void;
  export: LayoutExport;
  manifest: LayoutManifest;
  hooks?: LayoutHooks;
}

/**
 * Registered layout with metadata
 */
export interface RegisteredLayout extends LayoutRegistration {
  registeredAt: string;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalLayouts: number;
  layoutIds: string[];
  layouts: Array<{
    id: string;
    name: string;
    version: string;
    registeredAt: string;
  }>;
}

/**
 * Register a layout in the registry
 * @param layout - Layout definition
 * @throws {Error} If layout is invalid or already registered
 */
export function registerLayout(layout: LayoutRegistration): LayoutRegistration {
  // Validate layout structure
  if (!layout.id) {
    throw new Error("Layout must have an id");
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

  // Layout registration complete - no console output to avoid polluting renderer stdout

  return layout;
}

/**
 * Unregister a layout from the registry
 * @param layoutId - Layout identifier
 * @returns True if layout was unregistered
 */
export function unregisterLayout(layoutId: string): boolean {
  return layouts.delete(layoutId);
}

/**
 * Get a layout by ID
 * @param layoutId - Layout identifier
 * @returns Layout definition or null if not found
 */
export function getLayout(layoutId: string): RegisteredLayout | null {
  return layouts.get(layoutId) || null;
}

/**
 * Get all registered layouts
 * @returns Array of all registered layouts
 */
export function getAllLayouts(): RegisteredLayout[] {
  return Array.from(layouts.values());
}

/**
 * Get layout IDs
 * @returns Array of layout IDs
 */
export function getLayoutIds(): string[] {
  return Array.from(layouts.keys());
}

/**
 * Check if a layout is registered
 * @param layoutId - Layout identifier
 * @returns True if layout is registered
 */
export function hasLayout(layoutId: string): boolean {
  return layouts.has(layoutId);
}

/**
 * Get view components for a layout
 * @param layoutId - Layout identifier
 * @returns View components by section ID
 * @throws {Error} If layout not found
 */
export function getViewComponents(
  layoutId: string
): Record<string, ComponentType<Record<string, unknown>>> {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.view;
}

/**
 * Get editable components for a layout
 * @param layoutId - Layout identifier
 * @returns Editable components by section ID
 * @throws {Error} If layout not found
 */
export function getEditableComponents(
  layoutId: string
): Record<string, ComponentType<Record<string, unknown>>> {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.editable;
}

/**
 * Get shared components for a layout
 * @param layoutId - Layout identifier
 * @returns Shared components
 * @throws {Error} If layout not found
 */
export function getSharedComponents(
  layoutId: string
): Record<string, ComponentType<Record<string, unknown>>> {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.components.shared || {};
}

/**
 * Get component registry for a layout (all components organized by type)
 * @param layoutId - Layout identifier
 * @param editMode - Whether in edit mode
 * @returns Component mappings by section ID
 */
export function getComponentRegistry(
  layoutId: string,
  editMode = false
): Record<string, ComponentType<Record<string, unknown>>> {
  const components = editMode ? getEditableComponents(layoutId) : getViewComponents(layoutId);

  return components;
}

/**
 * Get layout manifest
 * @param layoutId - Layout identifier
 * @returns Layout manifest
 * @throws {Error} If layout not found
 */
export function getLayoutManifest(layoutId: string): LayoutManifest {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.manifest;
}

/**
 * Get export functions for a layout
 * @param layoutId - Layout identifier
 * @returns Export functions
 * @throws {Error} If layout not found
 */
export function getLayoutExport(layoutId: string): LayoutExport {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.export;
}

/**
 * Get layout hooks
 * @param layoutId - Layout identifier
 * @returns Layout-specific hooks
 */
export function getLayoutHooks(layoutId: string): LayoutHooks {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  return layout.hooks || {};
}

/**
 * Apply layout styles
 * @param layoutId - Layout identifier
 * @throws {Error} If layout not found
 */
export function applyLayoutStyles(layoutId: string): void {
  const layout = getLayout(layoutId);
  if (!layout) {
    throw new Error(`Layout '${layoutId}' not found in registry`);
  }
  if (layout.styles && typeof layout.styles === "function") {
    layout.styles();
  }
}

/**
 * Clear all registered layouts (useful for testing)
 */
export function clearRegistry(): void {
  layouts.clear();
}

/**
 * Get registry statistics
 * @returns Registry stats
 */
export function getRegistryStats(): RegistryStats {
  return {
    totalLayouts: layouts.size,
    layoutIds: getLayoutIds(),
    layouts: getAllLayouts().map((l) => ({
      id: l.id,
      name: l.name,
      version: l.version,
      registeredAt: l.registeredAt,
    })),
  };
}

// Export for debugging
declare global {
  interface Window {
    __layoutRegistry?: {
      getStats: typeof getRegistryStats;
      getLayout: typeof getLayout;
      getAllLayouts: typeof getAllLayouts;
    };
  }
}

if (typeof window !== "undefined") {
  window.__layoutRegistry = {
    getStats: getRegistryStats,
    getLayout,
    getAllLayouts,
  };
}
