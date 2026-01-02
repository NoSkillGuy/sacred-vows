/**
 * Stub assetService for renderer context
 * The renderer doesn't need image upload functionality, so this provides a no-op implementation
 * This allows editable components to be imported without errors during SSR build
 */

export async function uploadImage(
  _file: File,
  _onProgress?: (progress: number) => void
): Promise<{ url: string; asset: { id: string; url: string; [key: string]: unknown } }> {
  // No-op in renderer context - image uploads are not supported in published sites
  throw new Error("Image upload is not available in renderer context");
}

export async function deleteImage(_imageUrl: string): Promise<void> {
  // No-op in renderer context
  throw new Error("Image deletion is not available in renderer context");
}

export async function getAssets(): Promise<Array<{ id: string; url: string; [key: string]: unknown }>> {
  // No-op in renderer context
  return [];
}

