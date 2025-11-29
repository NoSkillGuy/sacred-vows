import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import './ExportModal.css';

function ExportModal({ isOpen, onClose }) {
  const { currentInvitation } = useBuilderStore();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('static');

  const handleExport = async () => {
    setExporting(true);
    try {
      // In production, this would call the API to generate and download the export
      const response = await fetch(`/api/invitations/${currentInvitation.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: exportFormat }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-invitation-${currentInvitation.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export invitation. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <h3>Export Invitation</h3>
          <button className="export-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-body">
          <div className="form-group">
            <label className="form-label">Export Format</label>
            <select
              className="form-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="static">Static HTML Site</option>
              <option value="pdf">PDF Document</option>
              <option value="zip">ZIP Archive</option>
            </select>
          </div>

          <div className="export-info">
            <p>The exported invitation will include:</p>
            <ul>
              <li>All invitation content</li>
              <li>Images and assets</li>
              <li>Styles and scripts</li>
              <li>Ready to deploy to any hosting</li>
            </ul>
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={exporting || !currentInvitation.id}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;

