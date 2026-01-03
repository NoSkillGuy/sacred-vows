import { useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout, type User } from "../../services/authService";
import { useToast } from "../Toast/ToastProvider";
import EditableText from "@shared/layouts/classic-scroll/components/shared/EditableText";
import DeleteInvitationModal from "./DeleteInvitationModal";
import {
  useInvitationsQuery,
  useDeleteInvitationMutation,
  useUpdateInvitationMutation,
  type Invitation,
} from "../../hooks/queries/useInvitations";
import "./Dashboard.css";

// SVG Icons
const RingsIcon = (): JSX.Element => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="currentColor" />
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const PlusIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const EyeIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CalendarIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ProfileIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const InvitationIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
    <path d="M20 22v.01" />
  </svg>
);

const GlobeIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

interface HeartIconProps {
  className?: string;
}

const HeartIcon = ({ className }: HeartIconProps): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const WELCOME_TOAST_KEY_PREFIX = "sv_welcome_toast_shown";
const WELCOME_TOAST_DELAY_MS = 280;

function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Query hooks
  const { data: invitations = [], isLoading: loading } = useInvitationsQuery();
  const deleteMutation = useDeleteInvitationMutation();
  const updateMutation = useUpdateInvitationMutation();

  useEffect(() => {
    const currentUser = getCurrentUser();
    // Initialize state from external source - this is acceptable for initialization
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(currentUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => document.removeEventListener("mousedown", handleClickOutside as EventListener);
  }, []);

  function handleDeleteClick(id: string): void {
    const invitation = invitations.find((inv) => inv.id === id);
    if (invitation) {
      setInvitationToDelete(invitation);
      setDeleteModalOpen(true);
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!invitationToDelete) return;

    try {
      await deleteMutation.mutateAsync(invitationToDelete.id);
      setDeleteModalOpen(false);
      setInvitationToDelete(null);
      addToast({
        tone: "info",
        title: "Invitation Deleted",
        description: "The invitation has been permanently deleted.",
        icon: "heart",
      });
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      addToast({
        tone: "error",
        title: "Delete Failed",
        description: "Failed to delete invitation. Please try again.",
        icon: "bell",
      });
    }
  }

  function handleDeleteCancel(): void {
    setDeleteModalOpen(false);
    setInvitationToDelete(null);
  }

  function getWelcomeToastKey(currentUser: User | null): string {
    const identifier = currentUser?.id || currentUser?.email || currentUser?.name || "guest";
    return `${WELCOME_TOAST_KEY_PREFIX}_${identifier}`;
  }

  function handleLogout(): void {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(getWelcomeToastKey(user));
    }
    logout();
    navigate("/login");
  }

  function getInitials(name?: string): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getFirstName(name?: string): string {
    if (!name) return "there";
    return name.trim().split(" ")[0] || "there";
  }

  function truncateLabel(text: string, maxLength: number = 28): string {
    if (!text) return "";
    return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
  }

  function getToastDurationMs(): number {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
      return 5000;
    }
    return 6000;
  }

  async function handleInvitationTitleUpdate(id: string, newTitle: string): Promise<void> {
    const trimmedTitle = newTitle?.trim() || "Untitled Invitation";

    try {
      await updateMutation.mutateAsync({
        id,
        updates: { title: trimmedTitle },
      });
    } catch (error) {
      console.error("Failed to update invitation title:", error);
      addToast({
        tone: "error",
        title: "Update Failed",
        description: "Could not update the invitation name. Please try again.",
        icon: "bell",
      });
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Calculate stats
  const totalInvitations = invitations.length;
  // Treat undefined/null status as 'draft' for defensive filtering
  const publishedCount = invitations.filter((inv) => inv.status === "published").length;
  const draftCount = invitations.filter((inv) => !inv.status || inv.status === "draft").length;

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (typeof sessionStorage === "undefined") return;

    const toastKey = getWelcomeToastKey(user);
    if (sessionStorage.getItem(toastKey)) return;

    const firstName = getFirstName(user.name);
    const displayName = truncateLabel(firstName);
    const fullLine = `${firstName} — Everything you need to wow your guests.`;
    const displayLine = `${displayName} — Everything you need to wow your guests.`;

    const timer = setTimeout(() => {
      addToast({
        title: "Welcome back",
        description: displayLine,
        tooltip: fullLine,
        duration: getToastDurationMs(),
        icon: "heart",
        tone: "info",
        ariaLive: "polite",
      });
      sessionStorage.setItem(toastKey, "true");
    }, WELCOME_TOAST_DELAY_MS);

    return () => clearTimeout(timer);
  }, [addToast, loading, user]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="page-loading">
            <div className="page-loading-spinner">
              <RingsIcon />
            </div>
            <p>Loading your invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <Link to="/dashboard" className="header-logo">
              <div className="header-logo-icon">
                <RingsIcon />
              </div>
              <span className="header-logo-text">Sacred Vows</span>
            </Link>
          </div>

          <div className="header-actions">
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {getInitials(user?.name)}
              </div>

              <div className={`user-dropdown ${dropdownOpen ? "open" : ""}`}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.name || "Guest"}</div>
                  <div className="user-dropdown-email">{user?.email || ""}</div>
                </div>
                <Link
                  to="/profile"
                  className="user-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <ProfileIcon />
                  Profile
                </Link>
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <LogoutIcon />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-quickstart">
          <div className="quickstart-copy">
            <p className="section-label">Quick start</p>
            <h2>Launch your invitation in 3 steps</h2>
            <p className="section-subtitle">Pick a layout, add details, share your link.</p>
          </div>
          <div className="quickstart-actions">
            <button className="btn btn-primary" onClick={() => navigate("/layouts")}>
              <PlusIcon />
              Choose layout
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
              <EyeIcon />
              Preview later
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/layouts")}>
              See examples
            </button>
          </div>
        </div>

        {/* Stats */}
        {totalInvitations > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon gold">
                <InvitationIcon />
              </div>
              <div className="stat-content">
                <h3>{totalInvitations}</h3>
                <p>Total Invitations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon sage">
                <GlobeIcon />
              </div>
              <div className="stat-content">
                <h3>{publishedCount}</h3>
                <p>Published</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon rose">
                <EditIcon />
              </div>
              <div className="stat-content">
                <h3>{draftCount}</h3>
                <p>Drafts</p>
              </div>
            </div>
          </div>
        )}

        {/* Invitations */}
        {totalInvitations === 0 ? (
          <div className="dashboard-empty">
            <HeartIcon className="dashboard-empty-icon" />
            <h3>No Invitations Yet</h3>
            <p>
              Start creating your beautiful wedding invitation. Choose from our premium layouts.
            </p>
            <Link to="/layouts" className="btn btn-primary">
              <PlusIcon />
              Create Your First Invitation
            </Link>
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2>Your Invitations</h2>
            </div>

            <div className="invitations-grid">
              {/* Create New Card */}
              <Link to="/layouts" className="create-new-card">
                <div className="create-new-icon">
                  <PlusIcon />
                </div>
                <span className="create-new-text">Create New</span>
                <span className="create-new-subtext">Start from a layout</span>
              </Link>

              {/* Invitation Cards */}
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onEdit={() => navigate(`/builder/${invitation.id}`)}
                  onDelete={() => handleDeleteClick(invitation.id)}
                  onTitleUpdate={handleInvitationTitleUpdate}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInvitationModal
        isOpen={deleteModalOpen}
        invitation={invitationToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

interface InvitationCardProps {
  invitation: Invitation;
  onEdit: () => void;
  onDelete: () => void;
  onTitleUpdate: (id: string, title: string) => void;
  formatDate: (dateString?: string) => string;
}

function InvitationCard({
  invitation,
  onEdit,
  onDelete,
  onTitleUpdate,
  formatDate,
}: InvitationCardProps): JSX.Element {
  const { id, title, data, status, layoutId, createdAt } = invitation;

  // Extract couple names from data if available (used as fallback)
  const coupleData = data?.couple || {};
  const getBrideName = (): string | undefined => {
    if (!coupleData.bride) return undefined;
    if (typeof coupleData.bride === "string") return coupleData.bride;
    if (typeof coupleData.bride === "object" && "name" in coupleData.bride) {
      return (coupleData.bride as { name?: string }).name;
    }
    return undefined;
  };
  const getGroomName = (): string | undefined => {
    if (!coupleData.groom) return undefined;
    if (typeof coupleData.groom === "string") return coupleData.groom;
    if (typeof coupleData.groom === "object" && "name" in coupleData.groom) {
      return (coupleData.groom as { name?: string }).name;
    }
    return undefined;
  };
  const brideName = getBrideName();
  const groomName = getGroomName();
  const fallbackCoupleName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || "Untitled Invitation";
  const displayTitle = title?.trim() || fallbackCoupleName;

  const weddingDate = (data as { weddingDate?: string })?.weddingDate || createdAt;

  return (
    <article className="invitation-card">
      <div className="invitation-preview">
        {/* Preview placeholder - could be an actual preview image */}
        <div className="layout-preview-placeholder" style={{ display: "flex" }}>
          <RingsIcon />
        </div>
        <span className={`invitation-status ${status || "draft"}`}>{status || "Draft"}</span>
      </div>

      <div className="invitation-info">
        <EditableText
          value={displayTitle}
          onUpdate={(path: string, value: unknown) => onTitleUpdate?.(id, value as string)}
          path={`invitations.${id}.title`}
          className="invitation-couple"
          tag="h3"
          placeholder="Click to name your invitation"
        />
        <div className="invitation-date">
          <CalendarIcon />
          {formatDate(weddingDate)}
        </div>
        <div className="invitation-layout">Layout: {layoutId || "Classic Scroll"}</div>

        <div className="invitation-actions">
          <button className="btn btn-primary" onClick={onEdit}>
            <EditIcon />
            Edit
          </button>
          <button className="btn btn-secondary" onClick={onEdit}>
            <EyeIcon />
            Preview
          </button>
          <button
            className="btn btn-icon btn-secondary"
            onClick={onDelete}
            style={{ flex: "none" }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export default Dashboard;
