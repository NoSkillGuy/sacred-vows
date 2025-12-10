import React, { useMemo } from 'react';
import './TemplateCardUnified.css';

const defaultColors = {
  primary: '#d4af37',
  background: '#fff8f0',
  accent: '#c9a227',
};

function resolveColors(template) {
  const defaultTheme = template.themes?.find((theme) => theme.isDefault) || template.themes?.[0];
  const colors = defaultTheme?.colors || {};
  return {
    primary: colors.primary || defaultColors.primary,
    background: colors.background || defaultColors.background,
    accent: colors.accent || colors.secondary || defaultColors.accent,
  };
}

function TemplateCardUnified({
  template,
  onPrimaryAction,
  primaryLabel = 'Use This Template',
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
  const { primary, background, accent } = useMemo(() => resolveColors(template), [template]);
  const displayNames = template.names || template.name;
  const displayDate = template.date || null;
  const tags = [
    ...(template.tags || []),
    template.isFeatured ? 'featured' : null,
  ].filter(Boolean).slice(0, 4);
  const isReady = template.status === 'ready' || template.isAvailable;
  const badge =
    badgeOverride ||
    (!isReady ? 'Coming Soon' : template.isFeatured ? 'Featured' : null);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(template);
  };

  const handlePrimary = (e) => {
    e.stopPropagation();
    if (onPrimaryAction) onPrimaryAction(template);
  };

  const handleSecondary = (e) => {
    e.stopPropagation();
    if (onSecondaryAction) onSecondaryAction(template);
  };

  return (
    <div
      className={`template-card-unified ${!isReady ? 'coming-soon' : ''} ${active ? 'active' : ''}`}
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

      <div className="unified-preview">
        <div
          className="unified-inner"
          style={{
            background: `linear-gradient(180deg, ${background} 0%, ${accent} 100%)`,
            borderColor: primary,
          }}
        >
          <div className="unified-ornament" style={{ color: primary }}>✦</div>
          <div className="unified-names">{displayNames}</div>
          {displayDate ? (
            <div className="unified-date" style={{ color: primary }}>
              {displayDate}
            </div>
          ) : null}
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

      <div className="unified-info">
        <div className="unified-colors">
          {[primary, background, accent].map((color, i) => (
            <span
              key={color + i}
              className="color-dot"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        <div className="unified-meta">
          {template.category && <span className="unified-tag">{template.category}</span>}
          {tags.map((tag) => (
            <span key={tag} className="unified-tag badge">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplateCardUnified;
