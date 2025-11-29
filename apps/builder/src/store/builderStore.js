import { create } from 'zustand';
import { defaultWeddingConfig } from '../config/wedding-config';
import { updateInvitation, autoSaveInvitation } from '../services/invitationService';

/**
 * Builder Store
 * Manages state for the wedding invitation builder
 */
export const useBuilderStore = create((set, get) => {
  let autoSaveTimer = null;

  return {
    // Current invitation being edited
    currentInvitation: {
      id: null,
      templateId: 'royal-elegance',
      data: defaultWeddingConfig,
      translations: null, // Will be loaded from translations file
    },

    // Loading and error states
    loading: false,
    error: null,
    saving: false,

  // Update invitation data
  updateInvitationData: (path, value) => {
    const { currentInvitation } = get();
    const newData = { ...currentInvitation.data };
    
    // Support dot notation paths (e.g., 'couple.bride.name')
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
    
    // Auto-save if invitation has an ID
    if (updatedInvitation.id) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(async () => {
        try {
          set({ saving: true });
          await updateInvitation(updatedInvitation.id, { data: newData });
          set({ saving: false });
        } catch (error) {
          console.error('Auto-save error:', error);
          set({ saving: false, error: error.message });
        }
      }, 2000);
    }
  },

  // Update nested object (e.g., entire couple object)
  updateNestedData: (path, value) => {
    const { currentInvitation } = get();
    
    // Helper function for deep merge that creates new object references
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
    
    // Create a new data object with all new references
    const newData = { ...currentInvitation.data };
    const keys = path.split('.');
    
    // For simple paths like 'couple', directly update with deep merge
    if (keys.length === 1) {
      const existing = newData[keys[0]] || {};
      // Deep merge the value into existing object, creating new references
      newData[keys[0]] = deepMerge(existing, value);
    } else {
      // For nested paths, create new references for each level
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          // Create a new object reference
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      // Update the final key with deep merge
      const targetKey = keys[keys.length - 1];
      const existing = current[targetKey] || {};
      current[targetKey] = deepMerge(existing, value);
    }
    
    // Create a completely new invitation object to ensure Zustand detects the change
    const updatedInvitation = {
      ...currentInvitation,
      data: newData,
    };
    
    set({ currentInvitation: updatedInvitation });
    
    // Auto-save if invitation has an ID
    if (updatedInvitation.id) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(async () => {
        try {
          set({ saving: true });
          await updateInvitation(updatedInvitation.id, { data: newData });
          set({ saving: false });
        } catch (error) {
          console.error('Auto-save error:', error);
          set({ saving: false, error: error.message });
        }
      }, 2000);
    }
  },

  // Set entire invitation
  setInvitation: (invitation) => {
    set({ currentInvitation: invitation });
  },

  // Reset to default
  resetToDefault: () => {
    clearTimeout(autoSaveTimer);
    set({
      currentInvitation: {
        id: null,
        templateId: 'royal-elegance',
        data: defaultWeddingConfig,
        translations: null,
      },
      error: null,
      saving: false,
    });
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),
  };
});

