import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, ReactElement } from 'react';
import { trackCTA, trackExperiment, trackLayoutDemo, trackLayoutView } from '../../services/analyticsService';
import type { LayoutManifest } from '@shared/types/layout';
import LayoutCardUnified from '../Layouts/LayoutCardUnified';
import { useAllLayoutManifestsQuery } from '../../hooks/queries/useLayouts';

// SVG Ornaments for each layout style
const OrnamentClassic = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5C20 5 25 10 25 15C25 20 22 22 20 22C18 22 15 20 15 15C15 10 20 5 20 5Z" fill="currentColor" opacity="0.7"/>
    <path d="M20 35C20 35 15 30 15 25C15 20 18 18 20 18C22 18 25 20 25 25C25 30 20 35 20 35Z" fill="currentColor" opacity="0.7"/>
    <path d="M5 20C5 20 10 15 15 15C20 15 22 18 22 20C22 22 20 25 15 25C10 25 5 20 5 20Z" fill="currentColor" opacity="0.7"/>
    <path d="M35 20C35 20 30 25 25 25C20 25 18 22 18 20C18 18 20 15 25 15C30 15 35 20 35 20Z" fill="currentColor" opacity="0.7"/>
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>
);

const OrnamentFloral = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="5" fill="currentColor"/>
    <ellipse cx="20" cy="8" rx="4" ry="7" fill="currentColor" opacity="0.6"/>
    <ellipse cx="20" cy="32" rx="4" ry="7" fill="currentColor" opacity="0.6"/>
    <ellipse cx="8" cy="20" rx="7" ry="4" fill="currentColor" opacity="0.6"/>
    <ellipse cx="32" cy="20" rx="7" ry="4" fill="currentColor" opacity="0.6"/>
  </svg>
);

const OrnamentStar = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4L22.5 15H33.5L24.5 22L27 33L20 26L13 33L15.5 22L6.5 15H17.5L20 4Z" fill="currentColor"/>
  </svg>
);

const OrnamentLeaf = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5C8 15 8 25 20 35C32 25 32 15 20 5Z" fill="currentColor" opacity="0.7"/>
    <path d="M20 10V32" stroke="white" strokeWidth="1" opacity="0.5"/>
  </svg>
);

const OrnamentDiamond = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="5" width="21" height="21" rx="2" transform="rotate(45 20 5)" fill="currentColor"/>
  </svg>
);

const OrnamentSun = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="8" fill="currentColor"/>
    <path d="M20 4V10M20 30V36M36 20H30M10 20H4M31.3 8.7L27 13M13 27L8.7 31.3M31.3 31.3L27 27M13 13L8.7 8.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

type OrnamentComponent = () => ReactElement;

const ornamentByCategory: Record<string, OrnamentComponent> = {
  traditional: OrnamentClassic,
  floral: OrnamentFloral,
  romantic: OrnamentFloral,
  modern: OrnamentStar,
  minimal: OrnamentDiamond,
  bohemian: OrnamentLeaf,
  luxury: OrnamentSun,
};

const defaultColors = {
  primary: '#d4af37',
  accent: '#c9a227',
  background: '#fff8f0',
};

interface Filter {
  id: string;
  label: string;
}

interface EnrichedLayout extends LayoutManifest {
  Ornament: OrnamentComponent;
  ornamentColor: string;
  names?: string;
  date?: string | null;
  className: string;
  tags: string[];
  isReady: boolean;
}

interface LayoutShowcaseProps {
  onSectionView?: (sectionId: string) => void;
}

function LayoutShowcase({ onSectionView }: LayoutShowcaseProps): ReactElement {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [demoLayout, setDemoLayout] = useState<EnrichedLayout | null>(null);

  // Query hook
  const { data: layouts = [], isLoading: loading } = useAllLayoutManifestsQuery();

  useEffect(() => {
    if (onSectionView) onSectionView('layouts');
    trackExperiment('layouts_filters', 'chips_search_v1');
  }, [onSectionView]);

  const filters = useMemo<Filter[]>(() => {
    const categories = Array.from(
      new Set(layouts.map((layout) => layout.metadata?.tags?.[0] || layout.metadata?.category || '').filter(Boolean))
    );

    return [
      { id: 'all', label: 'All' },
      { id: 'popular', label: 'Popular' },
      ...categories.map((category) => ({ id: category, label: category.charAt(0).toUpperCase() + category.slice(1) })),
    ];
  }, [layouts]);

  const enrichedLayouts = useMemo<EnrichedLayout[]>(() => {
    return layouts.map((layout) => {
      const category = layout.metadata?.tags?.[0] || layout.metadata?.category || 'modern';
      const Ornament = ornamentByCategory[category] || OrnamentSun;
      const defaultTheme = layout.themes?.find((theme) => theme.isDefault) || layout.themes?.[0];
      const colors = defaultTheme?.colors || {};
      const accent = (colors as any).accent || (colors as any).primary || defaultColors.accent;
      const tags = [
        ...(layout.metadata?.tags || []),
        layout.metadata?.featured ? 'popular' : null,
      ].filter(Boolean) as string[];
      const tagsSlice = tags.slice(0, 3);

      return {
        ...layout,
        Ornament,
        ornamentColor: accent,
        names: (layout as any).names || layout.name,
        date: (layout as any).date || null,
        className: (layout as any).className || `layout-${layout.id}`,
        tags: tagsSlice,
        isReady: (layout as any).status === 'ready' || (layout as any).isAvailable || true,
      };
    });
  }, [layouts]);

  const filteredLayouts = useMemo<EnrichedLayout[]>(() => {
    const filtered = enrichedLayouts.filter((layout) => {
      const matchesFilter =
        activeFilter === 'all' ||
        layout.metadata?.category === activeFilter ||
        layout.tags?.includes(activeFilter);
      const matchesQuery = layout.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
    return filtered;
  }, [activeFilter, query, enrichedLayouts]);

  const handleCustomize = (layout: EnrichedLayout): void => {
    if (!layout.isReady) return;
    trackCTA('layouts_customize', { layoutId: layout.id });
    navigate('/signup', { state: { layoutId: layout.id } });
  };

  const handleDemo = (layout: EnrichedLayout): void => {
    setDemoLayout(layout);
    trackLayoutDemo(layout.id);
  };

  return (
    <section id="layouts" className="layouts-section">
      <div className="section-header">
        <p className="section-label">Our Collection</p>
        <h2 className="section-title">Beautiful Layouts for Every Love Story</h2>
        <p className="section-subtitle">
          Choose from our handcrafted collection of stunning invitation designs, 
          each thoughtfully created to capture the unique essence of your celebration.
        </p>
      </div>

      <div className="layouts-actions">
        <div className="filter-chips" role="tablist" aria-label="Layout categories">
          {filters.map((filter) => (
            <button
              key={filter.id}
              role="tab"
              aria-selected={activeFilter === filter.id}
              className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="layout-search">
          <input
            type="search"
            placeholder="Search layouts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search layouts"
          />
        </div>
      </div>

      <div className="layouts-carousel-wrapper">
        <div className="layouts-grid">
          {loading ? (
            <div className="layouts-loading">
              <div className="loading-spinner" />
              <p>Loading layouts...</p>
            </div>
          ) : (
            filteredLayouts.map((layout) => (
              <LayoutCardUnified
                key={layout.id}
                layout={layout}
                onPrimaryAction={handleCustomize}
                primaryLabel={layout.isReady ? 'Customize This Design' : 'Coming Soon'}
                primaryDisabled={!layout.isReady}
                onSecondaryAction={handleDemo}
                secondaryLabel="View Demo"
                showSecondary
                onCardClick={() => trackLayoutView(layout.id)}
              />
            ))
          )}
        </div>
      </div>

      {demoLayout && (
        <div
          className="layout-demo-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDemoLayout(null);
          }}
        >
          <div className="layout-demo-content">
            <div className="layout-demo-header">
              <div>
                <p className="section-label">Live preview</p>
                <h3>{demoLayout.name}</h3>
                <p className="layout-desc">{demoLayout.metadata?.description || ''}</p>
              </div>
              <button className="close-btn" aria-label="Close preview" onClick={() => setDemoLayout(null)}>×</button>
            </div>
            <div className="layout-demo-body">
              <div className={`layout-card ${demoLayout.className} demo-mode`}>
                <div className="layout-preview">
                  <div className="layout-inner">
                    <div className="layout-ornament" style={{ color: demoLayout.ornamentColor }}>
                      <demoLayout.Ornament />
                    </div>
                    <div className="layout-names">{demoLayout.names}</div>
                    <div className="layout-date">{demoLayout.date}</div>
                    <div className="layout-ornament" style={{ color: demoLayout.ornamentColor, transform: 'rotate(180deg)' }}>
                      <demoLayout.Ornament />
                    </div>
                  </div>
                </div>
              </div>
              <div className="layout-demo-actions">
                <button className="cta-primary" onClick={() => handleCustomize(demoLayout)}>
                  Start with this layout
                </button>
                <button className="cta-secondary" onClick={() => setDemoLayout(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default LayoutShowcase;

