import { apiRequest } from './apiClient';

export async function validateSubdomain(invitationId, subdomain) {
  const response = await apiRequest('/publish/validate', {
    method: 'POST',
    body: JSON.stringify({ invitationId, subdomain }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Validation failed' }));
    throw new Error(err.error || 'Validation failed');
  }
  return await response.json();
}

export async function publishInvitation(invitationId, subdomain) {
  const response = await apiRequest('/publish', {
    method: 'POST',
    body: JSON.stringify({ invitationId, subdomain }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Publish failed' }));
    throw new Error(err.error || 'Publish failed');
  }
  return await response.json();
}

export async function listVersions(subdomain) {
  const response = await apiRequest(`/published/versions?subdomain=${encodeURIComponent(subdomain)}`, {
    method: 'GET',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to list versions' }));
    throw new Error(err.error || 'Failed to list versions');
  }
  return await response.json();
}

export async function rollbackToVersion(subdomain, version) {
  const response = await apiRequest('/published/rollback', {
    method: 'POST',
    body: JSON.stringify({ subdomain, version }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Rollback failed' }));
    throw new Error(err.error || 'Rollback failed');
  }
  return await response.json();
}


