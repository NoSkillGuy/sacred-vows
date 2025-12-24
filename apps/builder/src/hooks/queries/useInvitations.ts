/**
 * TanStack Query hooks for invitation operations
 * Handles fetching, creating, updating, and deleting invitations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvitations,
  getInvitation,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  type Invitation,
} from "../../services/invitationService";
import type { UniversalWeddingData, LayoutConfig } from "@shared/types/wedding-data";

// Query keys for consistent cache management
export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...invitationKeys.lists(), filters] as const,
  details: () => [...invitationKeys.all, "detail"] as const,
  detail: (id: string) => [...invitationKeys.details(), id] as const,
};

/**
 * Query hook to fetch all invitations for the current user
 */
export function useInvitationsQuery() {
  return useQuery({
    queryKey: invitationKeys.lists(),
    queryFn: getInvitations,
  });
}

/**
 * Query hook to fetch a single invitation by ID
 * @param id - Invitation ID
 * @param enabled - Whether the query should run (default: true)
 */
export function useInvitationQuery(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: invitationKeys.detail(id!),
    queryFn: () => getInvitation(id!),
    enabled: Boolean(id) && enabled,
  });
}

interface CreateInvitationPayload {
  layoutId?: string;
  data?: UniversalWeddingData;
  layoutConfig?: LayoutConfig;
  title?: string;
}

/**
 * Mutation hook to create a new invitation
 */
export function useCreateInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitationPayload) => createInvitation(payload),
    onSuccess: (newInvitation) => {
      // Invalidate and refetch invitations list
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      // Optionally set the new invitation in cache
      queryClient.setQueryData(invitationKeys.detail(newInvitation.id), newInvitation);
    },
  });
}

interface UpdateInvitationPayload {
  data?: UniversalWeddingData;
  layoutConfig?: LayoutConfig;
  layoutId?: string;
  title?: string;
  status?: string;
  [key: string]: unknown; // Allow additional fields like title
}

/**
 * Mutation hook to update an invitation with optimistic updates
 */
export function useUpdateInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateInvitationPayload }) =>
      updateInvitation(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: invitationKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: invitationKeys.lists() });

      // Snapshot the previous value
      const previousInvitation = queryClient.getQueryData<Invitation>(invitationKeys.detail(id));
      const previousInvitations = queryClient.getQueryData<Invitation[]>(invitationKeys.lists());

      // Optimistically update the invitation
      if (previousInvitation) {
        queryClient.setQueryData<Invitation>(invitationKeys.detail(id), {
          ...previousInvitation,
          ...updates,
        });
      }

      // Optimistically update the invitations list
      if (previousInvitations) {
        queryClient.setQueryData<Invitation[]>(
          invitationKeys.lists(),
          previousInvitations.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
        );
      }

      // Return context with snapshots for rollback
      return { previousInvitation, previousInvitations };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousInvitation) {
        queryClient.setQueryData(invitationKeys.detail(_variables.id), context.previousInvitation);
      }
      if (context?.previousInvitations) {
        queryClient.setQueryData(invitationKeys.lists(), context.previousInvitations);
      }
    },
    onSuccess: (updatedInvitation, variables) => {
      // Update cache with server response
      queryClient.setQueryData(invitationKeys.detail(variables.id), updatedInvitation);
      // Invalidate list to ensure consistency
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
    },
  });
}

/**
 * Mutation hook to delete an invitation with optimistic updates
 */
export function useDeleteInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: invitationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: invitationKeys.detail(id) });

      // Snapshot the previous value
      const previousInvitations = queryClient.getQueryData<Invitation[]>(invitationKeys.lists());

      // Optimistically remove the invitation from the list
      if (previousInvitations) {
        queryClient.setQueryData<Invitation[]>(
          invitationKeys.lists(),
          previousInvitations.filter((inv) => inv.id !== id)
        );
      }

      // Return context for rollback
      return { previousInvitations };
    },
    onError: (_error, _id, context) => {
      // Rollback on error
      if (context?.previousInvitations) {
        queryClient.setQueryData(invitationKeys.lists(), context.previousInvitations);
      }
    },
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: invitationKeys.detail(id) });
      // Invalidate list to ensure consistency
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
    },
  });
}
