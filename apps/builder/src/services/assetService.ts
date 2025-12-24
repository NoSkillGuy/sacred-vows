/**
 * Asset Service
 * Handles image uploads and asset management
 */

import { apiRequest } from "./apiClient";
import { getAccessToken } from "./tokenStorage";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface Asset {
  id: string;
  url: string;
  [key: string]: unknown;
}

export interface UploadResult {
  url: string;
  asset: Asset;
  index?: number;
  error?: Error;
}

interface UploadResponse {
  url: string;
  asset: Asset;
}

interface ErrorResponse {
  error: string;
}

interface AssetsResponse {
  assets: Asset[];
}

interface CountResponse {
  count: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Upload a single image file with progress tracking
 * @param file - Image file to upload
 * @param onProgress - Progress callback (progress: number 0-100)
 * @returns Upload result
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; asset: Asset }> {
  // Client-side validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const uploadFn = async (): Promise<{ url: string; asset: Asset }> => {
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = getAccessToken();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as UploadResponse;
            resolve({ url: data.url, asset: data.asset });
          } catch (error) {
            reject(new Error("Invalid response from server"));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText) as ErrorResponse;
            reject(new Error(errorData.error || "Upload failed"));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      xhr.open("POST", `${API_BASE_URL}/assets/upload`);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.withCredentials = true; // Include cookies
      xhr.send(formData);
    });
  };

  return retryWithBackoff(uploadFn);
}

/**
 * Upload multiple image files
 * @param files - Array of image files to upload
 * @param onFileProgress - Progress callback (fileIndex: number, progress: number 0-100)
 * @returns Array of upload results
 */
export async function uploadImages(
  files: File[],
  onFileProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> {
  const results = await Promise.allSettled(
    files.map((file, index) =>
      uploadImage(file, (progress) => {
        if (onFileProgress) {
          onFileProgress(index, progress);
        }
      }).then((result) => ({ ...result, index }))
    )
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        url: "",
        asset: {} as Asset,
        error: result.reason as Error,
        index,
      };
    }
  });
}

/**
 * Delete an uploaded image
 * @param imageUrl - URL of image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const response = await apiRequest("/assets/delete", {
    method: "DELETE",
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({ error: "Delete failed" }))) as ErrorResponse;
    throw new Error(errorData.error || "Delete failed");
  }
}

/**
 * Get list of uploaded assets for current user
 * @returns Array of asset objects
 */
export async function getAssets(): Promise<Asset[]> {
  const response = await apiRequest("/assets", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({ error: "Failed to fetch assets" }))) as ErrorResponse;
    throw new Error(errorData.error || "Failed to fetch assets");
  }

  const data = (await response.json()) as AssetsResponse;
  return data.assets || [];
}

/**
 * Get asset count by URLs
 * @param urls - Array of asset URLs
 * @returns Count of existing assets
 */
export async function getAssetCountByUrls(urls: string[]): Promise<number> {
  const response = await apiRequest("/assets/count-by-urls", {
    method: "POST",
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({ error: "Failed to get asset count" }))) as ErrorResponse;
    throw new Error(errorData.error || "Failed to get asset count");
  }

  const data = (await response.json()) as CountResponse;
  return data.count || 0;
}
