import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInvitations,
  getInvitation,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  autoSaveInvitation,
} from "./invitationService";

// Mock apiClient
vi.mock("./apiClient", () => ({
  apiRequest: vi.fn(),
}));

describe("invitationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInvitations", () => {
    it("should fetch all invitations successfully", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockInvitations = [
        {
          id: "inv-1",
          userId: "1",
          layoutId: "classic-scroll",
          data: { couple: { bride: { name: "Sarah" }, groom: { name: "John" } } },
          layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
        },
      ];

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({ invitations: mockInvitations }),
      } as Response);

      const result = await getInvitations();

      expect(result).toEqual(mockInvitations);
      expect(apiRequest).toHaveBeenCalledWith("/invitations", { method: "GET" });
    });
  });

  describe("getInvitation", () => {
    it("should fetch single invitation by ID", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockInvitation = {
        id: "inv-1",
        userId: "1",
        layoutId: "classic-scroll",
        data: { couple: { bride: { name: "Sarah" }, groom: { name: "John" } } },
        layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({ invitation: mockInvitation }),
      } as Response);

      const result = await getInvitation("inv-1");

      expect(result).toEqual(mockInvitation);
      expect(apiRequest).toHaveBeenCalledWith("/invitations/inv-1", { method: "GET" });
    });
  });

  describe("createInvitation", () => {
    it("should create a new invitation", async () => {
      const { apiRequest } = await import("./apiClient");
      const invitationData = {
        layoutId: "classic-scroll",
        data: { couple: { bride: { name: "Sarah" }, groom: { name: "John" } } },
      };
      const mockCreatedInvitation = {
        id: "inv-new",
        userId: "1",
        ...invitationData,
        layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({ invitation: mockCreatedInvitation }),
      } as Response);

      const result = await createInvitation(invitationData);

      expect(result).toEqual(mockCreatedInvitation);
      expect(apiRequest).toHaveBeenCalledWith("/invitations", {
        method: "POST",
        body: JSON.stringify(invitationData),
      });
    });
  });

  describe("updateInvitation", () => {
    it("should update an existing invitation", async () => {
      const { apiRequest } = await import("./apiClient");
      const updates = {
        data: { couple: { bride: { name: "Updated Sarah" }, groom: { name: "Updated John" } } },
      };
      const mockUpdatedInvitation = {
        id: "inv-1",
        userId: "1",
        layoutId: "classic-scroll",
        ...updates,
        layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({ invitation: mockUpdatedInvitation }),
      } as Response);

      const result = await updateInvitation("inv-1", updates);

      expect(result).toEqual(mockUpdatedInvitation);
      expect(apiRequest).toHaveBeenCalledWith("/invitations/inv-1", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    });
  });

  describe("deleteInvitation", () => {
    it("should delete an invitation", async () => {
      const { apiRequest } = await import("./apiClient");

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
      } as Response);

      await deleteInvitation("inv-1");

      expect(apiRequest).toHaveBeenCalledWith("/invitations/inv-1", {
        method: "DELETE",
      });
    });
  });

  describe("autoSaveInvitation", () => {
    it("should return a debounced save function", () => {
      const debouncedSave = autoSaveInvitation(
        "inv-1",
        { couple: { bride: { name: "Sarah" }, groom: { name: "John" } } },
        100
      );

      expect(typeof debouncedSave).toBe("function");
    });

    it("should return cancel function that can be called multiple times", async () => {
      const { apiRequest } = await import("./apiClient");
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => ({ invitation: { id: "inv-1" } }),
      } as Response);

      const data = { couple: { bride: { name: "Sarah" }, groom: { name: "John" } } };
      const debouncedSave = autoSaveInvitation("inv-1", data, 200);

      // Should be able to call multiple times without error
      expect(() => {
        debouncedSave();
        debouncedSave();
        debouncedSave();
      }).not.toThrow();
    });
  });
});
