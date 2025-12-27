import { apiRequest } from "./apiClient";

interface ErrorResponse {
  error: string;
}

interface ValidateResponse {
  available: boolean;
  normalizedSubdomain: string;
  reason?: string;
  [key: string]: unknown;
}

interface PublishResponse {
  subdomain: string;
  url: string;
  [key: string]: unknown;
}

interface VersionsResponse {
  versions: Array<{
    version: string;
    createdAt: string;
    [key: string]: unknown;
  }>;
}

interface RollbackResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export async function validateSubdomain(
  invitationId: string,
  subdomain: string
): Promise<ValidateResponse> {
  try {
    const response = await apiRequest("/publish/validate", {
      method: "POST",
      body: JSON.stringify({ invitationId, subdomain }),
    });
    if (!response.ok) {
      const err = (await response
        .json()
        .catch(() => ({ error: "Validation failed" }))) as ErrorResponse;
      throw new Error(err.error || "Validation failed");
    }
    const data = (await response.json()) as ValidateResponse;
    // Ensure the response has the expected structure
    if (typeof data.available !== "boolean" || !data.normalizedSubdomain) {
      console.error("Invalid validation response structure:", data);
      throw new Error("Invalid response from validation service");
    }
    return data;
  } catch (error) {
    console.error("Subdomain validation error:", error);
    throw error;
  }
}

export async function publishInvitation(
  invitationId: string,
  subdomain: string
): Promise<PublishResponse> {
  const response = await apiRequest("/publish", {
    method: "POST",
    body: JSON.stringify({ invitationId, subdomain }),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: "Publish failed" }))) as ErrorResponse;
    throw new Error(err.error || "Publish failed");
  }
  return (await response.json()) as PublishResponse;
}

export async function listVersions(subdomain: string): Promise<VersionsResponse> {
  const response = await apiRequest(
    `/published/versions?subdomain=${encodeURIComponent(subdomain)}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    const err = (await response
      .json()
      .catch(() => ({ error: "Failed to list versions" }))) as ErrorResponse;
    throw new Error(err.error || "Failed to list versions");
  }
  return (await response.json()) as VersionsResponse;
}

export async function rollbackToVersion(
  subdomain: string,
  version: string
): Promise<RollbackResponse> {
  const response = await apiRequest("/published/rollback", {
    method: "POST",
    body: JSON.stringify({ subdomain, version }),
  });
  if (!response.ok) {
    const err = (await response
      .json()
      .catch(() => ({ error: "Rollback failed" }))) as ErrorResponse;
    throw new Error(err.error || "Rollback failed");
  }
  return (await response.json()) as RollbackResponse;
}
