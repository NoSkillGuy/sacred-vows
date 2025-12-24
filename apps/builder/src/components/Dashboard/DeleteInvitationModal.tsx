import { useState, useEffect } from "react";
import { getAssetCountByUrls } from "../../services/assetService";
import { extractAssetURLs } from "../../utils/assetUtils";
import "./DeleteInvitationModal.css";

function DeleteInvitationModal({ isOpen, invitation, onConfirm, onCancel }) {
  const [assetCount, setAssetCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState(null);

  const invitationTitle = invitation?.title || "Untitled Invitation";
  const requiresConfirmText = invitationTitle.toLowerCase();

  useEffect(() => {
    if (isOpen && invitation?.data) {
      loadAssetCount();
    } else {
      setAssetCount(0);
      setConfirmText("");
      setError(null);
    }
  }, [isOpen, invitation]);

  async function loadAssetCount() {
    try {
      setLoading(true);
      setError(null);

      // Extract asset URLs from invitation data
      const assetURLs = extractAssetURLs(invitation.data);

      if (assetURLs.length === 0) {
        setAssetCount(0);
        return;
      }

      // Fetch asset count
      const count = await getAssetCountByUrls(assetURLs);
      setAssetCount(count);
    } catch (err) {
      console.error("Failed to load asset count:", err);
      setError("Failed to load asset information");
      // Don't block deletion if count fails
      setAssetCount(0);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (confirmText.toLowerCase() !== requiresConfirmText) {
      return;
    }
    onConfirm();
  }

  if (!isOpen) return null;

  const canConfirm = confirmText.toLowerCase() === requiresConfirmText;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h3>Delete Invitation</h3>
        </div>

        <div className="delete-modal-body">
          <div className="delete-modal-warning">
            <div className="warning-icon">⚠️</div>
            <p className="warning-text">
              You are about to delete <strong>"{invitationTitle}"</strong>.
            </p>
            {loading ? (
              <p className="asset-count-loading">Loading asset information...</p>
            ) : error ? (
              <p className="asset-count-error">{error}</p>
            ) : assetCount > 0 ? (
              <p className="asset-count-warning">
                This will also delete{" "}
                <strong>
                  {assetCount} uploaded photo{assetCount !== 1 ? "s" : ""}
                </strong>{" "}
                associated with this invitation.
              </p>
            ) : null}
            <p className="warning-final">
              <strong>This action cannot be undone.</strong>
            </p>
          </div>

          <div className="delete-modal-confirm">
            <label htmlFor="confirm-text">
              Type <strong>"{invitationTitle}"</strong> to confirm:
            </label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={invitationTitle}
              className="confirm-input"
              autoFocus
            />
          </div>
        </div>

        <div className="delete-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={!canConfirm}>
            Delete Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteInvitationModal;
