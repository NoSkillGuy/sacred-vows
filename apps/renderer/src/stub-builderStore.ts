/**
 * Stub builderStore for renderer context
 * The renderer doesn't need editing functionality, so this provides a no-op implementation
 * This allows layouts to import useEditable hooks without errors during SSR build
 */

export const useBuilderStore = () => ({
  updateInvitationData: (_path: string, _value: unknown): void => {
    // No-op in renderer context - editing is not supported in published sites
  },
});
