import React from 'react';
import './LayoutCardUnified.css';

/**
 * Classic Scroll Preview Component
 * Displays the traditional lines pattern for Classic Scroll layout
 */
function ClassicScrollPreview() {
  return (
    <div className="unified-scroll-preview">
      <div className="unified-scroll-section">
        <div className="unified-scroll-line wide" />
        <div className="unified-scroll-line" />
        <div className="unified-scroll-line short" />
      </div>
      
      <div className="unified-scroll-divider" />
      
      <div className="unified-scroll-section">
        <div className="unified-scroll-line wide" />
        <div className="unified-scroll-line" />
      </div>
      
      <div className="unified-scroll-divider" />
      
      <div className="unified-scroll-section">
        <div className="unified-scroll-line" />
        <div className="unified-scroll-line short" />
      </div>
      
      <div className="unified-scroll-divider" />
      
      <div className="unified-scroll-section">
        <div className="unified-scroll-line wide" />
        <div className="unified-scroll-line" />
      </div>
      
      <div className="unified-scroll-divider" />
      
      <div className="unified-scroll-section">
        <div className="unified-scroll-line" />
        <div className="unified-scroll-line short" />
      </div>
    </div>
  );
}

/**
 * Editorial Elegance Preview Component
 * Displays a magazine-style layout with hero image box, typography lines, and side image boxes
 */
function EditorialElegancePreview() {
  return (
    <div className="unified-editorial-preview">
      {/* Subtle grid pattern overlay */}
      <div className="unified-editorial-grid" />
      
      {/* Main editorial layout structure */}
      <div className="unified-editorial-content">
        {/* Top box - Main editorial picture/hero */}
        <div className="unified-editorial-hero-box" />
        
        {/* Spacing */}
        <div className="unified-scroll-divider" />
        
        
        {/* Center section with typography lines (headings) - matching Classic Scroll style */}
        <div className="unified-scroll-section">
          <div className="unified-scroll-line wide" />
          <div className="unified-scroll-line" />
          <div className="unified-scroll-line short" />
        </div>
        
        {/* Spacing */}
        <div className="unified-scroll-divider" />
        
        {/* Bottom section with left image box and right text lines */}
        <div className="unified-editorial-images">
          <div className="unified-editorial-image-box left" />
          <div className="unified-editorial-text-lines">
            <div className="unified-scroll-line" />
            <div className="unified-scroll-line wide" />
            <div className="unified-scroll-line short" />
            <div className="unified-scroll-line" />
            <div className="unified-scroll-divider" />
            <div className="unified-scroll-line wide" />
            <div className="unified-scroll-line" />
            <div className="unified-scroll-line short" />
            <div className="unified-scroll-line" />
          </div>
        </div>
        
        {/* Remaining space - Editorial themed thin lines */}
        <div className="unified-editorial-footer">
          <div className="unified-editorial-thin-line" />
          <div className="unified-editorial-thin-line short" />
        </div>
      </div>
    </div>
  );
}

/**
 * Layout Preview Background Component
 * Renders layout-specific background patterns based on layout ID
 * 
 * @param {Object} props
 * @param {string} props.layoutId - The layout identifier (e.g., 'classic-scroll', 'editorial-elegance')
 */
function LayoutPreviewBackground({ layoutId }) {
  // Normalize layout ID to handle potential variations
  const normalizedId = layoutId?.toLowerCase().trim();
  
  switch (normalizedId) {
    case 'classic-scroll':
      return <ClassicScrollPreview />;
    case 'editorial-elegance':
      return <EditorialElegancePreview />;
    default:
      // Fallback to Classic Scroll for unknown layouts
      // Log for debugging if needed
      if (normalizedId && normalizedId !== 'classic-scroll') {
        console.debug('Unknown layout ID for preview background:', layoutId, 'falling back to Classic Scroll');
      }
      return <ClassicScrollPreview />;
  }
}

export default LayoutPreviewBackground;

