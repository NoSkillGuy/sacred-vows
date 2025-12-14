import React, { useMemo } from 'react';
import './LayoutCardUnified.css';

function resolveTheme(layout) {
  if (layout.defaultTheme) return layout.defaultTheme;
  const themes = layout.themes || [];
  return themes.find((theme) => theme?.isDefault) || themes[0] || null;
}

function LayoutCardUnified({
  layout,
  onPrimaryAction,
  primaryLabel = 'Use This Layout',
  primaryDisabled = false,
  primaryLoading = false,
  onSecondaryAction,
  secondaryLabel = 'View Demo',
  showSecondary = false,
  onCardClick,
  active = false,
  showActiveBadge = false,
  badgeOverride,
}) {
  const resolvedTheme = useMemo(() => resolveTheme(layout), [layout]);
  const colors = resolvedTheme?.colors;
  const requiredColorKeys = ['primary', 'background', 'accent', 'text'];
  const hasAllColors = requiredColorKeys.every((key) => colors?.[key]);

  if (!resolvedTheme || !hasAllColors) {
    console.warn('Layout missing required theme colors', layout?.id || layout?.name);
    return null;
  }

  const { primary, background, accent, text } = colors;

  const baseTags = [
    ...(layout.tags || []),
    layout.isFeatured ? 'featured' : null,
  ].filter(Boolean);

  const seenTags = new Set();
  const tags = [];

  baseTags.forEach((tag) => {
    const key = String(tag).trim().toLowerCase();
    if (!key || seenTags.has(key)) return;
    seenTags.add(key);
    tags.push(tag);
  });

  const categoryTag =
    layout.category && !seenTags.has(String(layout.category).trim().toLowerCase())
      ? layout.category
      : null;

  const displayTags = tags.slice(0, 4);
  const isReady = layout.status === 'ready' || layout.isAvailable;
  const badge =
    badgeOverride ||
    (!isReady ? 'Coming Soon' : layout.isFeatured ? 'Featured' : null);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(layout);
  };

  const handlePrimary = (e) => {
    e.stopPropagation();
    if (onPrimaryAction) onPrimaryAction(layout);
  };

  const handleSecondary = (e) => {
    e.stopPropagation();
    if (onSecondaryAction) onSecondaryAction(layout);
  };

  return (
    <div
      className={`layout-card-unified ${!isReady ? 'coming-soon' : ''} ${active ? 'active' : ''}`}
      onClick={handleCardClick}
    >
      {badge && (
        <div className={`unified-badge ${!isReady ? 'coming' : ''}`}>
          {badge}
        </div>
      )}

      {showActiveBadge && active && (
        <div className="unified-active-badge">Current</div>
      )}

      <div className="unified-preview-pane">
        {/* Classic scroll layout preview (background) */}
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
          
        {/* Layout name and description (overlay) */}
        <div className="unified-preview-header">
          <h3 className="unified-preview-title">{layout.name}</h3>
          <p className="unified-preview-description">{layout.description}</p>
          <div className="unified-preview-meta">
            {categoryTag && <span className="unified-preview-tag">{categoryTag}</span>}
            {displayTags.map((tag) => (
              <span key={tag} className="unified-preview-tag badge">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(onPrimaryAction || (showSecondary && onSecondaryAction)) && (
        <div className="unified-overlay">
          <div className="unified-actions">
            {onPrimaryAction && (
              <button
                className="unified-btn primary"
                onClick={handlePrimary}
                disabled={primaryDisabled || !isReady}
              >
                {primaryLoading ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Loading...
                  </>
                ) : (
                  primaryLabel
                )}
              </button>
            )}
            {showSecondary && onSecondaryAction && (
              <button
                className="unified-btn secondary"
                onClick={handleSecondary}
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default LayoutCardUnified;
