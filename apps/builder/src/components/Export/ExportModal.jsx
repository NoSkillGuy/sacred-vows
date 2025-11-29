import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useLanguage } from '../../hooks/useLanguage';
import { exportInvitationAsZip, exportInvitationAsJSON } from '../../services/exportService';
import './ExportModal.css';

function ExportModal({ isOpen, onClose }) {
  const { currentInvitation } = useBuilderStore();
  const { translations } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('static');

  const handleExport = async () => {
    setExporting(true);
    try {
      if (exportFormat === 'json') {
        // Export as JSON backup
        exportInvitationAsJSON(currentInvitation.data);
        onClose();
        setExporting(false);
        return;
      }

      // Export as static site ZIP
      await exportInvitationAsZip(currentInvitation.data, translations);
      
      // Show success message
      alert('✅ Invitation exported successfully!\n\nNext steps:\n1. Extract the ZIP file\n2. Upload to Vercel/Netlify or your hosting\n3. Share the URL with your guests!');
      
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
              <option value="static">Static HTML Site (ZIP)</option>
              <option value="json">JSON Backup</option>
            </select>
          </div>

          <div className="export-info">
            <p><strong>What you'll get:</strong></p>
            <ul>
              <li>✅ Complete static website (HTML, CSS, JS)</li>
              <li>✅ All your content and images</li>
              <li>✅ Ready to deploy instantly</li>
              <li>✅ Works on any hosting platform</li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
              <strong>Next steps after download:</strong><br/>
              1. Extract the ZIP file<br/>
              2. Go to <a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a> or <a href="https://netlify.com" target="_blank" rel="noopener">netlify.com</a><br/>
              3. Drag & drop the folder<br/>
              4. Share your live URL! 🎉
            </p>
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Download & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;

