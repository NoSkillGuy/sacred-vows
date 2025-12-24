import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useInvitationsQuery, useInvitationQuery } from "./useInvitations";

// Mock invitationService
vi.mock("../../services/invitationService", () => ({
  getInvitations: vi.fn(),
  getInvitation: vi.fn(),
  createInvitation: vi.fn(),
  updateInvitation: vi.fn(),
  deleteInvitation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useInvitations hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useInvitationsQuery", () => {
    it("should fetch all invitations", async () => {
      const { getInvitations } = await import("../../services/invitationService");
      const mockInvitations = [
        { id: "inv-1", userId: "1", layoutId: "classic-scroll", data: {}, layoutConfig: {} },
      ];

      vi.mocked(getInvitations).mockResolvedValue(mockInvitations);

      const { result } = renderHook(() => useInvitationsQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvitations);
    });
  });

  describe("useInvitationQuery", () => {
    it("should fetch single invitation by ID", async () => {
      const invitationService = await import("../../services/invitationService");
      const mockInvitation = {
        id: "inv-1",
        userId: "1",
        layoutId: "classic-scroll",
        data: {},
        layoutConfig: {},
      };

      vi.mocked(invitationService.getInvitation).mockResolvedValue(mockInvitation);

      const { result } = renderHook(() => useInvitationQuery("inv-1", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvitation);
    });

    it("should not fetch when enabled is false", async () => {
      const invitationService = await import("../../services/invitationService");

      renderHook(() => useInvitationQuery("inv-1", false), {
        wrapper: createWrapper(),
      });

      expect(invitationService.getInvitation).not.toHaveBeenCalled();
    });
  });
});
