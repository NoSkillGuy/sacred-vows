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


