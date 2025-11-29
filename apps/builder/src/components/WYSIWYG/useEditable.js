import { useBuilderStore } from '../../store/builderStore';

/**
 * Hook for WYSIWYG editing
 * Provides update function that connects to the store
 */
export function useEditable() {
  const { updateInvitationData, updateNestedData } = useBuilderStore();

  const handleUpdate = (path, value) => {
    // Handle translation paths differently
    if (path.startsWith('translations.')) {
      // Translations are managed separately, update the invitation data structure
      // For now, we'll store custom translations in the invitation data
      const translationKey = path.replace('translations.', '');
      updateInvitationData(`customTranslations.${translationKey}`, value);
    } else if (path.includes('.')) {
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

