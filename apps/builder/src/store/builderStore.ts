import { create } from 'zustand';
import { defaultWeddingConfig, defaultLayoutConfig, SECTION_TYPES } from '../config/wedding-config';
import { updateInvitation } from '../services/invitationService';
import { getLayoutManifest as getLayoutManifestFromAPI } from '../services/layoutService';
import { getLayout, getLayoutManifest as getLayoutManifestFromRegistry, hasLayout } from '../layouts/registry';
import { parseInvitationData, calculateSectionEnabled } from '../layouts/editorial-elegance/utils/dataHelpers';
import type { InvitationData, SectionConfig, ThemeConfig, UniversalWeddingData } from '@shared/types/wedding-data';
import type { LayoutManifest } from '@shared/types/layout';
// Import layouts to ensure they're registered
import '../layouts/classic-scroll';
import '../layouts/editorial-elegance';

/**
 * Builder Store
 * Manages state for the wedding invitation builder
 * 
 * Data Structure:
 * - currentInvitation.data: Universal content data (preserved across layouts)
 * - currentInvitation.layoutConfig: Layout-specific config (sections, theme)
 */
const STORAGE_KEY = 'wedding-builder-autosave';

// Load from localStorage on initialization
function loadFromStorage(): InvitationData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<InvitationData>;
      // Ensure layoutConfig exists for backward compatibility
      if (!parsed.layoutConfig) {
        parsed.layoutConfig = { ...defaultLayoutConfig };
      }
      
      // Ensure data is an object, not an array or string
      parsed.data = parseInvitationData(parsed.data, { ...defaultWeddingConfig });
      
      // If layout is editorial-elegance and data is minimal, merge defaults
      if (parsed.layoutId === 'editorial-elegance' && Object.keys(parsed.data).length < 5) {
        // Note: We can't do async import here, so we'll rely on setCurrentInvitation to merge
        // But we can at least ensure it's an object
      }
      
      // Fallback for unsupported layouts
      if (parsed.layoutId && !hasLayout(parsed.layoutId)) {
        console.warn(`Layout '${parsed.layoutId}' is not available. Falling back to 'classic-scroll'.`);
        parsed.layoutId = 'classic-scroll';
      }
      
      return {
        id: parsed.id ?? null,
        layoutId: parsed.layoutId ?? 'classic-scroll',
        data: parsed.data ?? defaultWeddingConfig,
        layoutConfig: parsed.layoutConfig ?? { ...defaultLayoutConfig },
        translations: parsed.translations ?? null,
      };
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return {
    id: null,
    layoutId: 'classic-scroll',
    data: defaultWeddingConfig,
    layoutConfig: { ...defaultLayoutConfig },
    translations: null,
  };
}

// Save to localStorage
function saveToStorage(invitation: InvitationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invitation));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

interface BuilderStoreState {
  // Current invitation being edited (UI state only - server state managed by TanStack Query)
  currentInvitation: InvitationData;

  // Current layout manifest (loaded from API/file)
  currentLayoutManifest: LayoutManifest | null;

  // UI state only - saving state for autosave feedback
  saving: boolean;
  lastSavedAt: number | null;
}

interface BuilderStoreActions {
  // Layout Manifest Management
  // Note: loadLayoutManifest tries registry first, then falls back to API
  // For server state, use useLayoutManifestQuery hook instead
  loadLayoutManifest: () => Promise<LayoutManifest | null>;
  getLayoutFromRegistry: (layoutId: string) => unknown;
  setCurrentInvitation: (invitation: Partial<InvitationData>) => Promise<void>;
  setLayoutManifest: (manifest: LayoutManifest) => void;

  // Section Management
  validateSectionsAgainstManifest: (manifest: LayoutManifest) => SectionConfig[];
  getEnabledSections: () => SectionConfig[];
  getAllSections: () => SectionConfig[];
  reorderSections: (newOrder: string[]) => void;
  toggleSection: (sectionId: string) => void;
  enableSection: (sectionId: string) => void;
  disableSection: (sectionId: string) => void;

  // Theme Management
  getTheme: () => ThemeConfig;
  applyThemePreset: (presetId: string) => void;
  updateThemeColors: (colors: Partial<ThemeConfig['colors']>) => void;
  updateThemeFonts: (fonts: Partial<ThemeConfig['fonts']>) => void;
  updateTheme: (theme: ThemeConfig) => void;

  // Layout Switching
  switchLayout: (newLayoutId: string, newManifest: LayoutManifest) => Promise<void>;

  // Content Data Management
  updateInvitationData: (path: string, value: unknown) => void;
  updateNestedData: (path: string, value: Record<string, unknown>) => void;
  setInvitation: (invitation: Partial<InvitationData>) => Promise<void>;

  // Utility
  clearAutosave: () => void;
  resetToDefault: () => void;
}

type BuilderStore = BuilderStoreState & BuilderStoreActions;

export const useBuilderStore = create<BuilderStore>((set, get) => {
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Initialize from localStorage
  const initialInvitation = loadFromStorage();

  // Helper to trigger autosave
  const triggerAutosave = (updatedInvitation: InvitationData): void => {
    saveToStorage(updatedInvitation);
    set({ lastSavedAt: Date.now() });
    
    if (updatedInvitation.id) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(async () => {
        try {
          set({ saving: true });
          await updateInvitation(updatedInvitation.id!, {
            data: updatedInvitation.data,
            layoutConfig: updatedInvitation.layoutConfig,
          });
          set({ saving: false });
        } catch (error) {
          console.error('Auto-save error:', error);
          set({ saving: false });
        }
      }, 2000);
    }
  };

  return {
    // Current invitation being edited
    currentInvitation: initialInvitation,

    // Current layout manifest (loaded from API/file)
    currentLayoutManifest: null,

    // UI state only - saving state for autosave feedback
    saving: false,
    lastSavedAt: null,

    // =========================================================================
    // LAYOUT MANIFEST MANAGEMENT
    // =========================================================================

    /**
     * Load layout manifest for current layout
     * First tries the registry, then falls back to API
     */
    loadLayoutManifest: async (): Promise<LayoutManifest | null> => {
      const { currentInvitation } = get();
      const layoutId = currentInvitation.layoutId || 'classic-scroll';
      
      try {
        let manifest: LayoutManifest | null = null;
        
        // First, try to get manifest from registry (local)
        if (hasLayout(layoutId)) {
          manifest = getLayoutManifestFromRegistry(layoutId) as LayoutManifest;
          console.log(`Loaded layout manifest from registry: ${layoutId}`);
        } else {
          // Fallback to API
          console.log(`Layout ${layoutId} not in registry, fetching from API`);
          manifest = await getLayoutManifestFromAPI(layoutId);
        }
        
        if (!manifest) {
          console.error(`Failed to load manifest for layout: ${layoutId}`);
          return null;
        }
        
        // Set manifest first so validation can access it
        set({ currentLayoutManifest: manifest });
        
        // Validate and sync sections against manifest
        const { validateSectionsAgainstManifest } = get();
        const validatedSections = validateSectionsAgainstManifest(manifest);
        
        // Get updated invitation after section validation
        const { currentInvitation: updatedInvitationAfterValidation } = get();
        
        // If manifest has theme presets, sync them into layoutConfig for use in UI
        if (manifest?.themes && manifest.themes.length > 0) {
          const defaultTheme = manifest.themes.find(t => t.isDefault) || manifest.themes[0];
          const existingTheme = updatedInvitationAfterValidation.layoutConfig?.theme || {} as ThemeConfig;
          const hasPreset = Boolean(existingTheme.preset);

          const themeWithPreset: ThemeConfig = hasPreset || !defaultTheme ? existingTheme : {
            preset: defaultTheme.id,
            colors: existingTheme.colors || { ...defaultTheme.colors },
            fonts: existingTheme.fonts || defaultTheme.fonts || { heading: '', body: '', script: '' },
          };

          const updatedInvitation: InvitationData = {
            ...updatedInvitationAfterValidation,
            layoutConfig: {
              ...updatedInvitationAfterValidation.layoutConfig,
              themes: manifest.themes,
              theme: themeWithPreset,
            },
            data: {
              ...updatedInvitationAfterValidation.data,
              theme: themeWithPreset,
            },
          };
          set({ currentInvitation: updatedInvitation });
        }

        return manifest;
      } catch (error) {
        console.error('Failed to load layout manifest:', error);
        return null;
      }
    },
    
    /**
     * Get layout from registry
     * @param layoutId - Layout identifier
     * @returns Layout object or null
     */
    getLayoutFromRegistry: (layoutId: string): unknown => {
      return getLayout(layoutId);
    },

    /**
     * Set current invitation (e.g., after fetching from API)
     * @param invitation - Invitation object from backend
     */
    setCurrentInvitation: async (invitation: Partial<InvitationData>): Promise<void> => {
      // Support migration from layoutConfig to layoutConfig
      const layoutConfig = invitation.layoutConfig || {};
      const layoutId = invitation.layoutId || 'classic-scroll';
      
      // Parse data if it's a string
      let invitationData = parseInvitationData(invitation.data || {}, {}) as UniversalWeddingData;
      
      // Merge editorial-elegance defaults if needed (always merge for empty or minimal data)
      if (layoutId === 'editorial-elegance') {
        const dataKeys = Object.keys(invitationData).length;
        const shouldMerge = dataKeys === 0 || dataKeys < 5 || !invitationData.couple || !invitationData.wedding;
        
        if (shouldMerge) {
          try {
            const { mergeWithDefaults } = await import('../layouts/editorial-elegance/defaults');
            invitationData = mergeWithDefaults(invitationData) as UniversalWeddingData;
          } catch (error) {
            console.warn('Failed to load editorial-elegance defaults in setCurrentInvitation:', error);
          }
        }
      }
      
      const invitationWithConfig: InvitationData = {
        id: invitation.id ?? null,
        layoutId,
        data: invitationData,
        layoutConfig: {
          ...defaultLayoutConfig,
          ...layoutConfig,
        },
        translations: invitation.translations ?? null,
      };
      
      set({ currentInvitation: invitationWithConfig });
      saveToStorage(invitationWithConfig);
    },

    /**
     * Set layout manifest directly (for when loaded externally)
     */
    setLayoutManifest: (manifest: LayoutManifest): void => {
      set({ currentLayoutManifest: manifest });
    },

    // =========================================================================
    // SECTION MANAGEMENT
    // =========================================================================

    /**
     * Validate and sync sections against layout manifest
     * Removes sections not in manifest, adds missing sections, preserves user preferences
     * @param manifest - Layout manifest
     * @returns Validated sections array
     */
    validateSectionsAgainstManifest: (manifest: LayoutManifest): SectionConfig[] => {
      const { currentInvitation } = get();
      
      if (!manifest || !manifest.sections || !Array.isArray(manifest.sections)) {
        // If no manifest or invalid manifest, return current sections (backward compatibility)
        return currentInvitation.layoutConfig?.sections || [];
      }

      const currentSections = currentInvitation.layoutConfig?.sections || [];
      const manifestSectionIds = manifest.sections.map(s => s.id);
      
      // Create a map of current sections by ID for quick lookup
      const currentSectionsMap = new Map<string, SectionConfig>();
      currentSections.forEach(section => {
        currentSectionsMap.set(section.id, section);
      });

      // Build validated sections array based on manifest order
      const validatedSections = manifest.sections.map((manifestSection, index) => {
        const existingSection = currentSectionsMap.get(manifestSection.id);
        
        if (existingSection) {
          // Preserve user's enabled/disabled state, but ensure order matches manifest
          return {
            ...existingSection,
            order: index,
          };
        } else {
          // Add missing section with default enabled state from manifest
          return {
            id: manifestSection.id,
            enabled: calculateSectionEnabled(manifestSection),
            order: index,
          };
        }
      });

      // Update invitation if sections changed
      const currentIds = currentSections.map(s => s.id).sort().join(',');
      const validatedIds = validatedSections.map(s => s.id).sort().join(',');
      const currentOrders = currentSections.map(s => `${s.id}:${s.order}`).sort().join(',');
      const validatedOrders = validatedSections.map(s => `${s.id}:${s.order}`).sort().join(',');

      if (currentIds !== validatedIds || currentOrders !== validatedOrders) {
        const updatedInvitation: InvitationData = {
          ...currentInvitation,
          layoutConfig: {
            ...currentInvitation.layoutConfig,
            sections: validatedSections,
          },
        };
        set({ currentInvitation: updatedInvitation });
        // Don't trigger autosave here to avoid unnecessary saves during initialization
      }

      return validatedSections;
    },

    /**
     * Get ordered list of enabled sections
     * Filters sections to only include those defined in current layout manifest
     */
    getEnabledSections: (): SectionConfig[] => {
      const { currentInvitation, currentLayoutManifest } = get();
      let sections = currentInvitation.layoutConfig?.sections || [];
      
      // Filter by manifest if available
      if (currentLayoutManifest?.sections && Array.isArray(currentLayoutManifest.sections)) {
        const manifestSectionIds = new Set(currentLayoutManifest.sections.map(s => s.id));
        sections = sections.filter(s => manifestSectionIds.has(s.id));
      }
      
      const enabledSections = sections.filter(s => s.enabled);
      const result = enabledSections.sort((a, b) => a.order - b.order);
      
      return result;
    },

    /**
     * Get all sections (enabled and disabled)
     * Filters sections to only include those defined in current layout manifest
     */
    getAllSections: (): SectionConfig[] => {
      const { currentInvitation, currentLayoutManifest } = get();
      let sections = currentInvitation.layoutConfig?.sections || [];
      
      // Filter by manifest if available
      if (currentLayoutManifest?.sections && Array.isArray(currentLayoutManifest.sections)) {
        const manifestSectionIds = new Set(currentLayoutManifest.sections.map(s => s.id));
        sections = sections.filter(s => manifestSectionIds.has(s.id));
        
        // Use order property first (respects user reordering), fallback to manifest order
        const manifestOrder = new Map<string, number>();
        currentLayoutManifest.sections.forEach((s, index) => {
          manifestOrder.set(s.id, index);
        });
        
        sections = sections.sort((a, b) => {
          // Prioritize order property over manifest order to respect user reordering
          const orderA = a.order ?? manifestOrder.get(a.id) ?? 0;
          const orderB = b.order ?? manifestOrder.get(b.id) ?? 0;
          return orderA - orderB;
        });
      } else {
        // Fallback to current behavior if manifest not loaded
        sections = sections.slice().sort((a, b) => a.order - b.order);
      }
      
      return sections;
    },

    /**
     * Reorder sections
     * @param newOrder - Array of section IDs in new order
     */
    reorderSections: (newOrder: string[]): void => {
      const { currentInvitation } = get();
      const sections = [...(currentInvitation.layoutConfig?.sections || [])];
      
      // Update order for each section based on new order array
      const updatedSections = sections.map(section => ({
        ...section,
        order: newOrder.indexOf(section.id),
      }));

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          sections: updatedSections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Toggle section visibility
     * @param sectionId - Section ID to toggle
     */
    toggleSection: (sectionId: string): void => {
      const { currentInvitation, currentLayoutManifest } = get();
      const sections = [...(currentInvitation.layoutConfig?.sections || [])];
      
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      // Check if section is required (can't disable required sections)
      const manifestSection = currentLayoutManifest?.sections?.find(s => s.id === sectionId);
      if (manifestSection?.required && sections[sectionIndex].enabled) {
        console.warn(`Cannot disable required section: ${sectionId}`);
        return;
      }

      sections[sectionIndex] = {
        ...sections[sectionIndex],
        enabled: !sections[sectionIndex].enabled,
      };

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          sections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Enable a section (add it back if removed)
     * @param sectionId - Section ID to enable
     */
    enableSection: (sectionId: string): void => {
      const { currentInvitation } = get();
      const sections = [...(currentInvitation.layoutConfig?.sections || [])];
      
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        // Section exists, just enable it
        sections[sectionIndex] = {
          ...sections[sectionIndex],
          enabled: true,
        };
      } else {
        // Section doesn't exist, add it at the end
        const maxOrder = Math.max(...sections.map(s => s.order), -1);
        sections.push({
          id: sectionId,
          enabled: true,
          order: maxOrder + 1,
        });
      }

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          sections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Disable a section
     * @param sectionId - Section ID to disable
     */
    disableSection: (sectionId: string): void => {
      const { currentInvitation, currentLayoutManifest } = get();
      const sections = [...(currentInvitation.layoutConfig?.sections || [])];
      
      // Check if section is required
      const manifestSection = currentLayoutManifest?.sections?.find(s => s.id === sectionId);
      if (manifestSection?.required) {
        console.warn(`Cannot disable required section: ${sectionId}`);
        return;
      }

      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        sections[sectionIndex] = {
          ...sections[sectionIndex],
          enabled: false,
        };
      }

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          sections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    // =========================================================================
    // THEME MANAGEMENT
    // =========================================================================

    /**
     * Get current theme configuration
     */
    getTheme: (): ThemeConfig => {
      const { currentInvitation } = get();
      return currentInvitation.layoutConfig?.theme || currentInvitation.data?.theme || {} as ThemeConfig;
    },

    /**
     * Apply a theme preset from layout manifest
     * @param presetId - Theme preset ID
     */
    applyThemePreset: (presetId: string): void => {
      const { currentInvitation, currentLayoutManifest } = get();
      
      const preset = currentLayoutManifest?.themes?.find(t => t.id === presetId)
        || currentInvitation?.layoutConfig?.themes?.find(t => t.id === presetId);
      if (!preset) {
        console.warn(`Theme preset not found: ${presetId}`);
        return;
      }

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          theme: {
            preset: presetId,
            colors: { ...preset.colors },
            fonts: preset.fonts || { heading: '', body: '', script: '' },
          },
        },
        // Also update data.theme for backward compatibility
        data: {
          ...currentInvitation.data,
          theme: {
            preset: presetId,
            colors: { ...preset.colors },
            fonts: preset.fonts || { heading: '', body: '', script: '' },
          },
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update theme colors
     * @param colors - Color values to update
     */
    updateThemeColors: (colors: Partial<ThemeConfig['colors']>): void => {
      const { currentInvitation } = get();
      const currentTheme = currentInvitation.layoutConfig?.theme || {} as ThemeConfig;

      const updatedTheme: ThemeConfig = {
        ...currentTheme,
        preset: 'custom',
        colors: {
          ...currentTheme.colors,
          ...colors,
        },
      };

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          theme: updatedTheme,
        },
        data: {
          ...currentInvitation.data,
          theme: updatedTheme,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update theme fonts
     * @param fonts - Font values to update
     */
    updateThemeFonts: (fonts: Partial<ThemeConfig['fonts']>): void => {
      const { currentInvitation } = get();
      const currentTheme = currentInvitation.layoutConfig?.theme || {} as ThemeConfig;

      const updatedTheme: ThemeConfig = {
        ...currentTheme,
        preset: 'custom',
        fonts: {
          ...currentTheme.fonts,
          ...fonts,
        },
      };

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          theme: updatedTheme,
        },
        data: {
          ...currentInvitation.data,
          theme: updatedTheme,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update entire theme
     * @param theme - Complete theme object
     */
    updateTheme: (theme: ThemeConfig): void => {
      const { currentInvitation } = get();

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          theme,
        },
        data: {
          ...currentInvitation.data,
          theme,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    // =========================================================================
    // LAYOUT SWITCHING
    // =========================================================================

    /**
     * Switch to a different layout
     * Preserves universal content data, resets layout-specific config
     * @param newLayoutId - New layout ID
     * @param newManifest - New layout manifest
     */
    switchLayout: async (newLayoutId: string, newManifest: LayoutManifest): Promise<void> => {
      const { currentInvitation } = get();
      
      // Get default theme from new layout
      const defaultTheme = newManifest?.themes?.find(t => t.isDefault) || newManifest?.themes?.[0];
      
      // Get default sections from new layout manifest
      // Use manifest.sections array directly, maintaining their order
      let defaultSections: SectionConfig[] = [];
      if (newManifest?.sections && Array.isArray(newManifest.sections)) {
        defaultSections = newManifest.sections.map((sectionDef, index) => ({
          id: sectionDef.id,
          enabled: calculateSectionEnabled(sectionDef),
          order: sectionDef.order !== undefined ? sectionDef.order : index,
        }));
      } else if (newManifest?.defaultSectionOrder && Array.isArray(newManifest.defaultSectionOrder)) {
        // Fallback to defaultSectionOrder if sections array not available
        defaultSections = newManifest.defaultSectionOrder.map((id, index) => {
          const sectionDef = newManifest?.sections?.find(s => s.id === id);
          return {
            id,
            enabled: sectionDef ? calculateSectionEnabled(sectionDef) : true,
            order: index,
          };
        });
      }

      // Merge layout-specific default data if available
      // Ensure data is an object, not an array, string, or undefined
      const existingData = parseInvitationData(currentInvitation.data, {}) as UniversalWeddingData;
      let mergedData = { ...existingData };
      
      // For editorial-elegance layout, merge defaults
      if (newLayoutId === 'editorial-elegance') {
        try {
          const { mergeWithDefaults } = await import('../layouts/editorial-elegance/defaults');
          mergedData = mergeWithDefaults(existingData) as UniversalWeddingData;
        } catch (error) {
          console.warn('Failed to load editorial-elegance defaults:', error);
        }
      }

      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        layoutId: newLayoutId,
        // Merge default data with existing data
        data: {
          ...mergedData,
          // Update theme in data for backward compatibility
          theme: defaultTheme ? {
            preset: defaultTheme.id || 'default',
            colors: { ...defaultTheme.colors },
            fonts: defaultTheme.fonts || { heading: '', body: '', script: '' },
          } : currentInvitation.data.theme,
        },
        // Reset layout config to new layout defaults
        layoutConfig: {
          sections: defaultSections,
          themes: newManifest?.themes || currentInvitation.layoutConfig?.themes,
          theme: defaultTheme ? {
            preset: defaultTheme.id || 'default',
            colors: { ...defaultTheme.colors },
            fonts: defaultTheme.fonts || { heading: '', body: '', script: '' },
          } : currentInvitation.layoutConfig?.theme,
        },
      };

      set({ 
        currentInvitation: updatedInvitation,
        currentLayoutManifest: newManifest,
      });
      triggerAutosave(updatedInvitation);
    },

    // =========================================================================
    // CONTENT DATA MANAGEMENT (existing functionality)
    // =========================================================================

    /**
     * Update invitation data (universal content)
     */
    updateInvitationData: (path: string, value: unknown): void => {
      const { currentInvitation } = get();
      
      const newData = JSON.parse(JSON.stringify(currentInvitation.data)) as UniversalWeddingData;
      const keys = path.split('.');
      let current: Record<string, unknown> = newData as Record<string, unknown>;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      
      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        data: newData,
      };
      
      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update nested object (e.g., entire couple object)
     */
    updateNestedData: (path: string, value: Record<string, unknown>): void => {
      const { currentInvitation } = get();
      
      const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
        const output = { ...target };
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
              output[key] = deepMerge((target[key] || {}) as Record<string, unknown>, source[key] as Record<string, unknown>);
            } else {
              output[key] = source[key];
            }
          }
        }
        return output;
      };
      
      const newData = { ...currentInvitation.data } as Record<string, unknown>;
      const keys = path.split('.');
      
      if (keys.length === 1) {
        const existing = (newData[keys[0]] || {}) as Record<string, unknown>;
        newData[keys[0]] = deepMerge(existing, value);
      } else {
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          } else {
            current[keys[i]] = { ...current[keys[i]] };
          }
          current = current[keys[i]] as Record<string, unknown>;
        }
        const targetKey = keys[keys.length - 1];
        const existing = (current[targetKey] || {}) as Record<string, unknown>;
        current[targetKey] = deepMerge(existing, value);
      }
      
      const updatedInvitation: InvitationData = {
        ...currentInvitation,
        data: newData as UniversalWeddingData,
      };
      
      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Set entire invitation
     */
    setInvitation: async (invitation: Partial<InvitationData>): Promise<void> => {
      // Ensure layoutConfig exists
      const layoutConfig = invitation.layoutConfig || {};
      let layoutId = invitation.layoutId || 'classic-scroll';
      
      // Fallback for unsupported layouts
      if (!hasLayout(layoutId)) {
        console.warn(`Layout '${layoutId}' is not available. Falling back to 'classic-scroll'.`);
        layoutId = 'classic-scroll';
      }
      
      // Parse data if it's a string
      let invitationData: UniversalWeddingData = invitation.data as UniversalWeddingData || {} as UniversalWeddingData;
      if (typeof invitationData === 'string') {
        try {
          invitationData = JSON.parse(invitationData) as UniversalWeddingData;
        } catch (e) {
          console.warn('Failed to parse data as JSON in setInvitation:', e);
          invitationData = {} as UniversalWeddingData;
        }
      }
      
      // Merge editorial-elegance defaults if needed
      if (layoutId === 'editorial-elegance') {
        try {
          const { mergeWithDefaults } = await import('../layouts/editorial-elegance/defaults');
          invitationData = mergeWithDefaults(invitationData) as UniversalWeddingData;
        } catch (error) {
          console.warn('Failed to load editorial-elegance defaults in setInvitation:', error);
        }
      }
      
      const invitationWithConfig: InvitationData = {
        id: invitation.id ?? null,
        layoutId,
        data: invitationData,
        layoutConfig: { ...defaultLayoutConfig, ...layoutConfig },
        translations: invitation.translations ?? null,
      };
      set({ currentInvitation: invitationWithConfig });
      saveToStorage(invitationWithConfig);
    },
    
    /**
     * Clear autosave data
     */
    clearAutosave: (): void => {
      localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Reset to default
     */
    resetToDefault: (): void => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const defaultInvitation: InvitationData = {
        id: null,
        layoutId: 'classic-scroll',
        data: defaultWeddingConfig,
        layoutConfig: { ...defaultLayoutConfig },
        translations: null,
      };
      set({
        currentInvitation: defaultInvitation,
        error: null,
        saving: false,
      });
      saveToStorage(defaultInvitation);
    },

  };
});

// Export section types for convenience
export { SECTION_TYPES };

