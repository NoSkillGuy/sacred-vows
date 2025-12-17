import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { exportInvitationAsJSON } from '../../services/exportService';
import { publishInvitation, validateSubdomain } from '../../services/publishService';
import './ExportModal.css';

function PublishModal({ isOpen, onClose }) {
  const { currentInvitation } = useBuilderStore();
  const [publishing, setPublishing] = useState(false);
  const [exportFormat, setExportFormat] = useState('publish');
  const [subdomain, setSubdomain] = useState('');
  const [normalized, setNormalized] = useState('');
  const [available, setAvailable] = useState(null); // null | boolean
  const [reason, setReason] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const validateReqIdRef = useRef(0);

  const invitationId = currentInvitation?.id;

  const canValidate = useMemo(() => subdomain.trim().length >= 1 && !!invitationId, [subdomain, invitationId]);

  useEffect(() => {
    if (!isOpen) return;
    setPublishedUrl('');
    setReason('');
    setAvailable(null);
    setNormalized('');
    setErrorMsg('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (exportFormat !== 'publish') return;
    if (!canValidate) {
      setAvailable(null);
      setReason('');
      setNormalized('');
      setErrorMsg('');
      return;
    }
    const t = setTimeout(async () => {
      const reqId = ++validateReqIdRef.current;
      try {
        const res = await validateSubdomain(invitationId, subdomain);
        if (!isOpen || reqId !== validateReqIdRef.current) return;
        setNormalized(res.normalizedSubdomain || '');
        setAvailable(!!res.available);
        setReason(res.reason || '');
        setErrorMsg('');
      } catch (e) {
        if (!isOpen || reqId !== validateReqIdRef.current) return;
        setAvailable(false);
        setReason('error');
        setErrorMsg('Failed to validate subdomain. Please try again.');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [isOpen, exportFormat, canValidate, invitationId, subdomain]);

  const handlePrimary = async () => {
    setPublishing(true);
    setErrorMsg('');
    try {
      if (exportFormat === 'json') {
        // Export as JSON backup - pass full invitation object
        exportInvitationAsJSON(currentInvitation);
        onClose();
        return;
      }
      // Publish
      if (!invitationId) throw new Error('Missing invitation');
      const res = await publishInvitation(invitationId, subdomain);
      setPublishedUrl(res.url || '');
      if (!res.url) throw new Error('Publish succeeded but no URL was returned.');
    } catch (error) {
      console.error('Publish error:', error);
      setErrorMsg(error?.message || 'Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <h3>Publish Invitation</h3>
          <button className="export-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-body">
          <div className="form-group">
            <label className="form-label">Action</label>
            <select
              className="form-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="publish">Publish to subdomain</option>
              <option value="json">JSON Backup</option>
            </select>
          </div>

          <div className="export-info">
            {exportFormat === 'publish' ? (
              <>
                <p><strong>Choose a subdomain:</strong></p>
                <div className="form-group">
                  <label className="form-label">Subdomain</label>
                  <input
                    className="form-select"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="e.g. john-wedding"
                  />
                  <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                    {available === null ? (
                      <span>Enter a subdomain to check availability.</span>
                    ) : available ? (
                      <span style={{ color: '#1a7f37' }}>Available: {normalized}</span>
                    ) : (
                      <span style={{ color: '#b42318' }}>Not available{normalized ? `: ${normalized}` : ''}{reason ? ` (${reason})` : ''}</span>
                    )}
                  </div>
                  {errorMsg ? (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#b42318' }}>
                      {errorMsg}
                    </div>
                  ) : null}
                </div>

                {publishedUrl ? (
                  <div style={{ marginTop: 12 }}>
                    <p><strong>Published URL</strong></p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="form-select" readOnly value={publishedUrl} />
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigator.clipboard?.writeText?.(publishedUrl)}
                      >
                        Copy
                      </button>
                      <a className="btn btn-primary" href={publishedUrl} target="_blank" rel="noopener">
                        Open
                      </a>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p><strong>JSON Backup</strong></p>
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                  Download a portable backup of your invitation data for safekeeping.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={publishing}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePrimary}
            disabled={publishing || (exportFormat === 'publish' && available !== true)}
          >
            {publishing ? 'Publishing...' : exportFormat === 'publish' ? 'Publish' : 'Download JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishModal;

