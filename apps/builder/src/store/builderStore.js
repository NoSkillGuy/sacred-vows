import { create } from 'zustand';
import { defaultWeddingConfig } from '../config/wedding-config';
import { updateInvitation, autoSaveInvitation } from '../services/invitationService';

/**
 * Builder Store
 * Manages state for the wedding invitation builder
 */
const STORAGE_KEY = 'wedding-builder-autosave';

// Load from localStorage on initialization
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return {
    id: null,
    templateId: 'royal-elegance',
    data: defaultWeddingConfig,
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

  return {
    // Current invitation being edited
    currentInvitation: initialInvitation,

    // Loading and error states
    loading: false,
    error: null,
    saving: false,
    lastSavedAt: null, // Timestamp of last localStorage save

  // Update invitation data
  updateInvitationData: (path, value) => {
    const { currentInvitation } = get();
    
    // Create deep clone to ensure proper immutability
    const newData = JSON.parse(JSON.stringify(currentInvitation.data));
    
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
    
    // Always save to localStorage (client-side autosave)
    saveToStorage(updatedInvitation);
    set({ lastSavedAt: Date.now() });
    
    // Also save to server if invitation has an ID (server-side autosave)
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
    
    // Always save to localStorage (client-side autosave)
    saveToStorage(updatedInvitation);
    set({ lastSavedAt: Date.now() });
    
    // Also save to server if invitation has an ID (server-side autosave)
    if (updatedInvitation.id) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(async () => {
        try {
          set({ saving: true });
          await updateInvitation(updatedInvitation.id, { data: newData });
          set({ saving: false });
        } catch (error) {
          console.error('Server auto-save error:', error);
          // Don't set error state for autosave failures, just log
          set({ saving: false });
        }
      }, 2000);
    }
  },

  // Set entire invitation
  setInvitation: (invitation) => {
    set({ currentInvitation: invitation });
    saveToStorage(invitation); // Also save to localStorage
  },
  
  // Clear autosave data
  clearAutosave: () => {
    localStorage.removeItem(STORAGE_KEY);
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

