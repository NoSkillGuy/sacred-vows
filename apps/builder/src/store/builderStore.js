import { create } from 'zustand';
import { defaultWeddingConfig, defaultTemplateConfig, SECTION_TYPES } from '../config/wedding-config';
import { updateInvitation } from '../services/invitationService';
import { getTemplateManifest } from '../services/templateService';

/**
 * Builder Store
 * Manages state for the wedding invitation builder
 * 
 * Data Structure:
 * - currentInvitation.data: Universal content data (preserved across templates)
 * - currentInvitation.templateConfig: Template-specific config (sections, theme)
 */
const STORAGE_KEY = 'wedding-builder-autosave';

// Load from localStorage on initialization
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure templateConfig exists for backward compatibility
      if (!parsed.templateConfig) {
        parsed.templateConfig = { ...defaultTemplateConfig };
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return {
    id: null,
    templateId: 'royal-elegance',
    data: defaultWeddingConfig,
    templateConfig: { ...defaultTemplateConfig },
    translations: null,
  };
}

// Save to localStorage
function saveToStorage(invitation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invitation));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export const useBuilderStore = create((set, get) => {
  let autoSaveTimer = null;
  
  // Initialize from localStorage
  const initialInvitation = loadFromStorage();

  // Helper to trigger autosave
  const triggerAutosave = (updatedInvitation) => {
    saveToStorage(updatedInvitation);
    set({ lastSavedAt: Date.now() });
    
    if (updatedInvitation.id) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(async () => {
        try {
          set({ saving: true });
          await updateInvitation(updatedInvitation.id, {
            data: updatedInvitation.data,
            templateConfig: updatedInvitation.templateConfig,
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

    // Current template manifest (loaded from API/file)
    currentTemplateManifest: null,

    // Loading and error states
    loading: false,
    error: null,
    saving: false,
    lastSavedAt: null,

    // =========================================================================
    // TEMPLATE MANIFEST MANAGEMENT
    // =========================================================================

    /**
     * Load template manifest for current template
     */
    loadTemplateManifest: async () => {
      const { currentInvitation } = get();
      try {
        const manifest = await getTemplateManifest(currentInvitation.templateId);
        // If manifest has theme presets, sync them into templateConfig for use in UI
        if (manifest?.themes?.length) {
          const defaultTheme = manifest.themes.find(t => t.isDefault) || manifest.themes[0];
          const existingTheme = currentInvitation.templateConfig?.theme || {};
          const hasPreset = Boolean(existingTheme.preset);

          const themeWithPreset = hasPreset || !defaultTheme ? existingTheme : {
            preset: defaultTheme.id,
            colors: existingTheme.colors || { ...defaultTheme.colors },
            fonts: existingTheme.fonts || { ...defaultTheme.fonts },
          };

          const updatedInvitation = {
            ...currentInvitation,
            templateConfig: {
              ...currentInvitation.templateConfig,
              themes: manifest.themes,
              theme: themeWithPreset,
            },
            data: {
              ...currentInvitation.data,
              theme: themeWithPreset,
            },
          };
          set({ currentInvitation: updatedInvitation });
        }

        set({ currentTemplateManifest: manifest });
        return manifest;
      } catch (error) {
        console.error('Failed to load template manifest:', error);
        return null;
      }
    },

    /**
     * Set current invitation (e.g., after fetching from API)
     * @param {Object} invitation - Invitation object from backend
     */
    setCurrentInvitation: (invitation) => {
      const invitationWithConfig = {
        ...invitation,
        templateConfig: {
          ...defaultTemplateConfig,
          ...invitation.templateConfig,
        },
      };
      set({ currentInvitation: invitationWithConfig });
      saveToStorage(invitationWithConfig);
    },

    /**
     * Set template manifest directly (for when loaded externally)
     */
    setTemplateManifest: (manifest) => {
      set({ currentTemplateManifest: manifest });
    },

    // =========================================================================
    // SECTION MANAGEMENT
    // =========================================================================

    /**
     * Get ordered list of enabled sections
     */
    getEnabledSections: () => {
      const { currentInvitation } = get();
      const sections = currentInvitation.templateConfig?.sections || [];
      return sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);
    },

    /**
     * Get all sections (enabled and disabled)
     */
    getAllSections: () => {
      const { currentInvitation } = get();
      return (currentInvitation.templateConfig?.sections || [])
        .slice()
        .sort((a, b) => a.order - b.order);
    },

    /**
     * Reorder sections
     * @param {string[]} newOrder - Array of section IDs in new order
     */
    reorderSections: (newOrder) => {
      const { currentInvitation } = get();
      const sections = [...(currentInvitation.templateConfig?.sections || [])];
      
      // Update order for each section based on new order array
      const updatedSections = sections.map(section => ({
        ...section,
        order: newOrder.indexOf(section.id),
      }));

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
          sections: updatedSections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Toggle section visibility
     * @param {string} sectionId - Section ID to toggle
     */
    toggleSection: (sectionId) => {
      const { currentInvitation, currentTemplateManifest } = get();
      const sections = [...(currentInvitation.templateConfig?.sections || [])];
      
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      // Check if section is required (can't disable required sections)
      const manifestSection = currentTemplateManifest?.sections?.find(s => s.id === sectionId);
      if (manifestSection?.required && sections[sectionIndex].enabled) {
        console.warn(`Cannot disable required section: ${sectionId}`);
        return;
      }

      sections[sectionIndex] = {
        ...sections[sectionIndex],
        enabled: !sections[sectionIndex].enabled,
      };

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
          sections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Enable a section (add it back if removed)
     * @param {string} sectionId - Section ID to enable
     */
    enableSection: (sectionId) => {
      const { currentInvitation } = get();
      const sections = [...(currentInvitation.templateConfig?.sections || [])];
      
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

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
          sections,
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Disable a section
     * @param {string} sectionId - Section ID to disable
     */
    disableSection: (sectionId) => {
      const { currentInvitation, currentTemplateManifest } = get();
      const sections = [...(currentInvitation.templateConfig?.sections || [])];
      
      // Check if section is required
      const manifestSection = currentTemplateManifest?.sections?.find(s => s.id === sectionId);
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

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
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
    getTheme: () => {
      const { currentInvitation } = get();
      return currentInvitation.templateConfig?.theme || currentInvitation.data?.theme || {};
    },

    /**
     * Apply a theme preset from template manifest
     * @param {string} presetId - Theme preset ID
     */
    applyThemePreset: (presetId) => {
      const { currentInvitation, currentTemplateManifest } = get();
      
      const preset = currentTemplateManifest?.themes?.find(t => t.id === presetId)
        || currentInvitation?.templateConfig?.themes?.find(t => t.id === presetId);
      if (!preset) {
        console.warn(`Theme preset not found: ${presetId}`);
        return;
      }

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
          theme: {
            preset: presetId,
            colors: { ...preset.colors },
            fonts: { ...preset.fonts },
          },
        },
        // Also update data.theme for backward compatibility
        data: {
          ...currentInvitation.data,
          theme: {
            preset: presetId,
            colors: { ...preset.colors },
            fonts: { ...preset.fonts },
          },
        },
      };

      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update theme colors
     * @param {Object} colors - Color values to update
     */
    updateThemeColors: (colors) => {
      const { currentInvitation } = get();
      const currentTheme = currentInvitation.templateConfig?.theme || {};

      const updatedTheme = {
        ...currentTheme,
        preset: 'custom',
        colors: {
          ...currentTheme.colors,
          ...colors,
        },
      };

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
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
     * @param {Object} fonts - Font values to update
     */
    updateThemeFonts: (fonts) => {
      const { currentInvitation } = get();
      const currentTheme = currentInvitation.templateConfig?.theme || {};

      const updatedTheme = {
        ...currentTheme,
        preset: 'custom',
        fonts: {
          ...currentTheme.fonts,
          ...fonts,
        },
      };

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
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
     * @param {Object} theme - Complete theme object
     */
    updateTheme: (theme) => {
      const { currentInvitation } = get();

      const updatedInvitation = {
        ...currentInvitation,
        templateConfig: {
          ...currentInvitation.templateConfig,
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
    // TEMPLATE SWITCHING
    // =========================================================================

    /**
     * Switch to a different template
     * Preserves universal content data, resets template-specific config
     * @param {string} newTemplateId - New template ID
     * @param {Object} newManifest - New template manifest
     */
    switchTemplate: async (newTemplateId, newManifest) => {
      const { currentInvitation } = get();
      
      // Get default theme from new template
      const defaultTheme = newManifest?.themes?.find(t => t.isDefault) || newManifest?.themes?.[0];
      
      // Get default sections from new template
      const defaultSections = (newManifest?.defaultSectionOrder || []).map((id, index) => {
        const sectionDef = newManifest?.sections?.find(s => s.id === id);
        return {
          id,
          enabled: sectionDef?.defaultEnabled !== false,
          order: index,
        };
      });

      const updatedInvitation = {
        ...currentInvitation,
        templateId: newTemplateId,
        // Preserve universal content data
        data: {
          ...currentInvitation.data,
          // Update theme in data for backward compatibility
          theme: defaultTheme ? {
            preset: defaultTheme.id,
            colors: { ...defaultTheme.colors },
            fonts: { ...defaultTheme.fonts },
          } : currentInvitation.data.theme,
        },
        // Reset template config to new template defaults
        templateConfig: {
          sections: defaultSections,
          themes: newManifest?.themes || currentInvitation.templateConfig?.themes,
          theme: defaultTheme ? {
            preset: defaultTheme.id,
            colors: { ...defaultTheme.colors },
            fonts: { ...defaultTheme.fonts },
          } : currentInvitation.templateConfig?.theme,
        },
      };

      set({ 
        currentInvitation: updatedInvitation,
        currentTemplateManifest: newManifest,
      });
      triggerAutosave(updatedInvitation);
    },

    // =========================================================================
    // CONTENT DATA MANAGEMENT (existing functionality)
    // =========================================================================

    /**
     * Update invitation data (universal content)
     */
    updateInvitationData: (path, value) => {
      const { currentInvitation } = get();
      
      const newData = JSON.parse(JSON.stringify(currentInvitation.data));
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      const updatedInvitation = {
        ...currentInvitation,
        data: newData,
      };
      
      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Update nested object (e.g., entire couple object)
     */
    updateNestedData: (path, value) => {
      const { currentInvitation } = get();
      
      const deepMerge = (target, source) => {
        const output = { ...target };
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
              output[key] = deepMerge(target[key] || {}, source[key]);
            } else {
              output[key] = source[key];
            }
          }
        }
        return output;
      };
      
      const newData = { ...currentInvitation.data };
      const keys = path.split('.');
      
      if (keys.length === 1) {
        const existing = newData[keys[0]] || {};
        newData[keys[0]] = deepMerge(existing, value);
      } else {
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          } else {
            current[keys[i]] = { ...current[keys[i]] };
          }
          current = current[keys[i]];
        }
        const targetKey = keys[keys.length - 1];
        const existing = current[targetKey] || {};
        current[targetKey] = deepMerge(existing, value);
      }
      
      const updatedInvitation = {
        ...currentInvitation,
        data: newData,
      };
      
      set({ currentInvitation: updatedInvitation });
      triggerAutosave(updatedInvitation);
    },

    /**
     * Set entire invitation
     */
    setInvitation: (invitation) => {
      // Ensure templateConfig exists
      const invitationWithConfig = {
        ...invitation,
        templateConfig: invitation.templateConfig || { ...defaultTemplateConfig },
      };
      set({ currentInvitation: invitationWithConfig });
      saveToStorage(invitationWithConfig);
    },
    
    /**
     * Clear autosave data
     */
    clearAutosave: () => {
      localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Reset to default
     */
    resetToDefault: () => {
      clearTimeout(autoSaveTimer);
      const defaultInvitation = {
        id: null,
        templateId: 'royal-elegance',
        data: defaultWeddingConfig,
        templateConfig: { ...defaultTemplateConfig },
        translations: null,
      };
      set({
        currentInvitation: defaultInvitation,
        error: null,
        saving: false,
      });
      saveToStorage(defaultInvitation);
    },

    /**
     * Set loading state
     */
    setLoading: (loading) => set({ loading }),

    /**
     * Set error state
     */
    setError: (error) => set({ error }),

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),
  };
});

// Export section types for convenience
export { SECTION_TYPES };
