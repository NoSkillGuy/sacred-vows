import { ReactElement } from 'react';
import './ImageDeletionNotice.css';

interface ImageDeletionNoticeProps {
  variant?: 'default' | 'compact' | 'warning';
}

/**
 * ImageDeletionNotice - Informational banner about 90-day image deletion policy
 * Displays clear messaging that uploaded images are deleted after 90 days,
 * while published sites preserve images permanently.
 */
function ImageDeletionNotice({ variant = 'default' }: ImageDeletionNoticeProps): ReactElement {
  return (
    <div className={`image-deletion-notice ${variant}`}>
      <div className="notice-icon">ℹ️</div>
      <div className="notice-content">
        <p className="notice-text">
          <strong>Note:</strong> Uploaded images are automatically deleted after 90 days. 
          Published sites preserve images permanently.
        </p>
      </div>
    </div>
  );
}

export default ImageDeletionNotice;

