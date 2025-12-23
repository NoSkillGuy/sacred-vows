/**
 * Invitation Service
 * Handles API calls for invitation CRUD operations
 */

import { apiRequest } from './apiClient';
import type { InvitationData, UniversalWeddingData, LayoutConfig } from '@shared/types/wedding-data';

export interface Invitation {
  id: string;
  userId: string;
  layoutId: string;
  data: UniversalWeddingData;
  layoutConfig: LayoutConfig;
  translations?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

interface InvitationsResponse {
  invitations: Invitation[];
}

interface InvitationResponse {
  invitation: Invitation;
}

interface UpdateInvitationPayload {
  data?: UniversalWeddingData;
  layoutConfig?: LayoutConfig;
  layoutId?: string;
}

/**
 * Get all invitations for current user
 * @returns Array of invitations
 */
export async function getInvitations(): Promise<Invitation[]> {
  try {
    const response = await apiRequest('/invitations', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }

    const data = await response.json() as InvitationsResponse;
    return data.invitations || [];
  } catch (error) {
    console.error('Get invitations error:', error);
    throw error;
  }
}

/**
 * Get single invitation
 * @param id - Invitation ID
 * @returns Invitation object
 */
export async function getInvitation(id: string): Promise<Invitation> {
  try {
    const response = await apiRequest(`/invitations/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitation');
    }

    const data = await response.json() as InvitationResponse;
    return data.invitation;
  } catch (error) {
    console.error('Get invitation error:', error);
    throw error;
  }
}

/**
 * Create new invitation
 * @param invitationData - Invitation data
 * @returns Created invitation
 */
export async function createInvitation(invitationData: Partial<Invitation>): Promise<Invitation> {
  try {
    const response = await apiRequest('/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }

    const data = await response.json() as InvitationResponse;
    return data.invitation;
  } catch (error) {
    console.error('Create invitation error:', error);
    throw error;
  }
}

/**
 * Update invitation
 * @param id - Invitation ID
 * @param updates - Updates to apply
 * @returns Updated invitation
 */
export async function updateInvitation(id: string, updates: UpdateInvitationPayload): Promise<Invitation> {
  try {
    const response = await apiRequest(`/invitations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update invitation');
    }

    const data = await response.json() as InvitationResponse;
    return data.invitation;
  } catch (error) {
    console.error('Update invitation error:', error);
    throw error;
  }
}

/**
 * Delete invitation
 * @param id - Invitation ID
 */
export async function deleteInvitation(id: string): Promise<void> {
  try {
    const response = await apiRequest(`/invitations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete invitation');
    }
  } catch (error) {
    console.error('Delete invitation error:', error);
    throw error;
  }
}

/**
 * Auto-save invitation (debounced)
 * @param id - Invitation ID
 * @param data - Invitation data
 * @param delay - Debounce delay in ms
 * @returns Cancel function
 */
export function autoSaveInvitation(id: string, data: UniversalWeddingData, delay: number = 2000): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  const save = async (): Promise<void> => {
    try {
      await updateInvitation(id, { data });
      console.log('Auto-saved');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const debouncedSave = (): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(save, delay);
  };

  return debouncedSave;
}

