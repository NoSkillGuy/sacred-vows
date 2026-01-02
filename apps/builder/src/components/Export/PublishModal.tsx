import { useEffect, useMemo, useRef, useState } from "react";
import { useBuilderStore } from "../../store/builderStore";
import {
  publishInvitation,
  validateSubdomain,
  listVersions,
  rollbackToVersion,
} from "../../services/publishService";
import "./PublishModal.css";

function PublishModal({ isOpen, onClose }) {
  const { currentInvitation } = useBuilderStore();
  const [publishing, setPublishing] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [normalized, setNormalized] = useState("");
  const [available, setAvailable] = useState(null); // null | boolean
  const [reason, setReason] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [versions, setVersions] = useState([]);
  const [, setLoadingVersions] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState(null);
  const validateReqIdRef = useRef(0);

  const invitationId = currentInvitation?.id;

  const canValidate = useMemo(
    () => subdomain.trim().length >= 1 && !!invitationId,
    [subdomain, invitationId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setPublishedUrl("");
    setReason("");
    setAvailable(null);
    setNormalized("");
    setErrorMsg("");
    setVersions([]);
    setRollbackTarget(null);
  }, [isOpen]);

  // Fetch versions when subdomain is available and site is published
  useEffect(() => {
    if (!isOpen) return;
    if (!normalized || !available) {
      setVersions([]);
      return;
    }

    const fetchVersions = async () => {
      setLoadingVersions(true);
      try {
        const res = await listVersions(normalized);
        setVersions(res.versions || []);
      } catch {
        // Silently fail - versions might not exist yet
        setVersions([]);
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [isOpen, normalized, available]);

  useEffect(() => {
    if (!isOpen) return;
    if (!canValidate) {
      setAvailable(null);
      setReason("");
      setNormalized("");
      setErrorMsg("");
      return;
    }
    const t = setTimeout(async () => {
      const reqId = ++validateReqIdRef.current;
      try {
        const res = await validateSubdomain(invitationId, subdomain);
        if (!isOpen || reqId !== validateReqIdRef.current) return;
        setNormalized(res.normalizedSubdomain || "");
        setAvailable(!!res.available);
        setReason(res.reason || "");
        setErrorMsg("");
      } catch (error) {
        if (!isOpen || reqId !== validateReqIdRef.current) return;
        console.error("Subdomain validation failed:", error);
        setAvailable(false);
        setReason("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to validate subdomain. Please try again.";
        setErrorMsg(errorMessage);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [isOpen, canValidate, invitationId, subdomain]);

  const handlePrimary = async () => {
    setPublishing(true);
    setErrorMsg("");
    try {
      if (!invitationId) throw new Error("Missing invitation");
      const res = await publishInvitation(invitationId, subdomain);
      setPublishedUrl(res.url || "");
      if (!res.url) throw new Error("Publish succeeded but no URL was returned.");

      // Refresh versions after publish
      if (normalized) {
        try {
          const versionsRes = await listVersions(normalized);
          setVersions(versionsRes.versions || []);
        } catch {
          // Ignore version fetch errors
        }
      }
    } catch (error) {
      console.error("Publish error:", error);
      setErrorMsg(error?.message || "Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (version) => {
    if (!normalized) return;

    setRollingBack(true);
    setErrorMsg("");
    try {
      await rollbackToVersion(normalized, version);
      // Refresh versions after rollback
      const versionsRes = await listVersions(normalized);
      setVersions(versionsRes.versions || []);
      setRollbackTarget(null);
      setErrorMsg("");
    } catch (error) {
      console.error("Rollback error:", error);
      setErrorMsg(error?.message || "Failed to rollback. Please try again.");
    } finally {
      setRollingBack(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="publish-modal-overlay" onClick={onClose}>
      <div className="publish-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="publish-modal-header">
          <h3>Publish Invitation</h3>
          <button className="publish-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="publish-modal-body">
          <div className="publish-info">
            <p>
              <strong>Choose a subdomain:</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Subdomain</label>
              <input
                className="form-select"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g. john-wedding"
              />
              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                {available === null ? (
                  <span>Enter a subdomain to check availability.</span>
                ) : available ? (
                  <span style={{ color: "#1a7f37" }}>Available: {normalized}</span>
                ) : (
                  <span style={{ color: "#b42318" }}>
                    Not available{normalized ? `: ${normalized}` : ""}
                    {reason ? ` (${reason})` : ""}
                  </span>
                )}
              </div>
              {errorMsg ? (
                <div style={{ marginTop: 8, fontSize: 13, color: "#b42318" }}>{errorMsg}</div>
              ) : null}
            </div>

            {publishedUrl ? (
              <div style={{ marginTop: 12 }}>
                <p>
                  <strong>Published URL</strong>
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="form-select" readOnly value={publishedUrl} />
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigator.clipboard?.writeText?.(publishedUrl)}
                  >
                    Copy
                  </button>
                  <a
                    className="btn btn-primary"
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Open
                  </a>
                </div>
              </div>
            ) : null}

            {versions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p>
                  <strong>Version History</strong>
                </p>
                <div className="version-list">
                  {versions.map((v) => (
                    <div key={v.version} className="version-item">
                      <span className="version-number">Version {v.version}</span>
                      {v.isCurrent && <span className="version-badge current">Current</span>}
                      {!v.isCurrent && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setRollbackTarget(v.version)}
                          disabled={rollingBack}
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rollbackTarget !== null && (
              <div
                className="rollback-confirmation"
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#fff3cd",
                  borderRadius: 4,
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                  Rollback to Version {rollbackTarget}?
                </p>
                <p style={{ margin: "0 0 8px 0", fontSize: 13 }}>
                  This will make Version {rollbackTarget} the active version. The current version
                  will remain available for rollback.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRollback(rollbackTarget)}
                    disabled={rollingBack}
                  >
                    {rollingBack ? "Rolling back..." : "Confirm Rollback"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRollbackTarget(null)}
                    disabled={rollingBack}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="publish-modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={publishing}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePrimary}
            disabled={publishing || available !== true}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
