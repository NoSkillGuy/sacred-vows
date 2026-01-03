// Import from builder's store via alias (only available in builder context)
// @ts-ignore - This import is resolved by vite alias in builder context
import { useBuilderStore } from "@shared/store/builderStore";

/**
 * Hook for WYSIWYG editing
 * Provides update function that connects to the store
 */
export function useEditable() {
  const { updateInvitationData } = useBuilderStore();

  const handleUpdate = (path: string, value: unknown): void => {
    // Handle translation paths differently
    if (path.startsWith("translations.")) {
      // Translations are managed separately, update the invitation data structure
      // For now, we'll store custom translations in the invitation data
      const translationKey = path.replace("translations.", "");
      updateInvitationData(`customTranslations.${translationKey}`, value);
    } else if (path.includes(".")) {
      // Nested path like 'couple.bride.name'
      updateInvitationData(path, value);
    } else {
      // Simple path
      updateInvitationData(path, value);
    }
  };

  return { handleUpdate };
}

export default useEditable;
