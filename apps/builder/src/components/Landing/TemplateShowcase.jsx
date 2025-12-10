import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { trackCTA, trackExperiment, trackTemplateDemo, trackTemplateView } from '../../services/analyticsService';

// SVG Ornaments for each template style
const OrnamentClassic = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5C20 5 25 10 25 15C25 20 22 22 20 22C18 22 15 20 15 15C15 10 20 5 20 5Z" fill="currentColor" opacity="0.7"/>
    <path d="M20 35C20 35 15 30 15 25C15 20 18 18 20 18C22 18 25 20 25 25C25 30 20 35 20 35Z" fill="currentColor" opacity="0.7"/>
    <path d="M5 20C5 20 10 15 15 15C20 15 22 18 22 20C22 22 20 25 15 25C10 25 5 20 5 20Z" fill="currentColor" opacity="0.7"/>
    <path d="M35 20C35 20 30 25 25 25C20 25 18 22 18 20C18 18 20 15 25 15C30 15 35 20 35 20Z" fill="currentColor" opacity="0.7"/>
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>
);

const OrnamentFloral = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="5" fill="currentColor"/>
    <ellipse cx="20" cy="8" rx="4" ry="7" fill="currentColor" opacity="0.6"/>
    <ellipse cx="20" cy="32" rx="4" ry="7" fill="currentColor" opacity="0.6"/>
    <ellipse cx="8" cy="20" rx="7" ry="4" fill="currentColor" opacity="0.6"/>
    <ellipse cx="32" cy="20" rx="7" ry="4" fill="currentColor" opacity="0.6"/>
  </svg>
);

const OrnamentStar = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4L22.5 15H33.5L24.5 22L27 33L20 26L13 33L15.5 22L6.5 15H17.5L20 4Z" fill="currentColor"/>
  </svg>
);

const OrnamentLeaf = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5C8 15 8 25 20 35C32 25 32 15 20 5Z" fill="currentColor" opacity="0.7"/>
    <path d="M20 10V32" stroke="white" strokeWidth="1" opacity="0.5"/>
  </svg>
);

const OrnamentDiamond = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="5" width="21" height="21" rx="2" transform="rotate(45 20 5)" fill="currentColor"/>
  </svg>
);

const OrnamentSun = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="8" fill="currentColor"/>
    <path d="M20 4V10M20 30V36M36 20H30M10 20H4M31.3 8.7L27 13M13 27L8.7 31.3M31.3 31.3L27 27M13 13L8.7 8.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const templates = [
  {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    description: 'Classic gold and cream design',
    className: 'template-royal-elegance',
    Ornament: OrnamentClassic,
    names: 'Priya & Rahul',
    date: 'Dec 15, 2025',
    ornamentColor: '#d4af37',
    category: 'traditional',
    tags: ['popular'],
    features: ['RSVP', 'Photo gallery', 'Music'],
  },
  {
    id: 'eternal-bloom',
    name: 'Eternal Bloom',
    description: 'Soft floral watercolor theme',
    className: 'template-eternal-bloom',
    Ornament: OrnamentFloral,
    names: 'Emma & James',
    date: 'June 8, 2025',
    ornamentColor: '#e8b4b8',
    category: 'floral',
    tags: ['new'],
    features: ['Floral art', 'Photo gallery', 'Multi-language'],
  },
  {
    id: 'midnight-romance',
    name: 'Midnight Romance',
    description: 'Dark elegant sophistication',
    className: 'template-midnight-romance',
    Ornament: OrnamentStar,
    names: 'Sophia & William',
    date: 'Nov 22, 2025',
    ornamentColor: '#d4af37',
    category: 'modern',
    tags: ['popular'],
    features: ['Dark mode', 'Animated hero', 'Music'],
  },
  {
    id: 'garden-dreams',
    name: 'Garden Dreams',
    description: 'Botanical illustrations',
    className: 'template-garden-dreams',
    Ornament: OrnamentLeaf,
    names: 'Olivia & Liam',
    date: 'April 18, 2025',
    ornamentColor: '#8fa88f',
    category: 'floral',
    tags: [],
    features: ['Botanical art', 'RSVP', 'Map'],
  },
  {
    id: 'classic-monogram',
    name: 'Classic Monogram',
    description: 'Timeless minimal design',
    className: 'template-classic-monogram',
    Ornament: OrnamentDiamond,
    names: 'Isabella & Noah',
    date: 'Sept 5, 2025',
    ornamentColor: '#2c2c2c',
    category: 'minimal',
    tags: ['minimal'],
    features: ['Monogram', 'Clean layout', 'RSVP'],
  },
  {
    id: 'sunset-serenade',
    name: 'Sunset Serenade',
    description: 'Warm gradient aesthetics',
    className: 'template-sunset-serenade',
    Ornament: OrnamentSun,
    names: 'Ava & Ethan',
    date: 'Aug 12, 2025',
    ornamentColor: '#e6a87c',
    category: 'modern',
    tags: ['new'],
    features: ['Gradient', 'Timeline', 'Music'],
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'modern', label: 'Modern' },
  { id: 'floral', label: 'Floral' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'popular', label: 'Popular' },
  { id: 'new', label: 'New' },
];

function TemplateShowcase({ onSectionView }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [demoTemplate, setDemoTemplate] = useState(null);

  useEffect(() => {
    if (onSectionView) onSectionView('templates');
    trackExperiment('templates_filters', 'chips_search_v1');
  }, [onSectionView]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesFilter =
        activeFilter === 'all' ||
        template.category === activeFilter ||
        template.tags?.includes(activeFilter);
      const matchesQuery = template.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const handleCustomize = (template) => {
    trackCTA('templates_customize', { templateId: template.id });
    navigate('/signup', { state: { templateId: template.id } });
  };

  const handleDemo = (template) => {
    setDemoTemplate(template);
    trackTemplateDemo(template.id);
  };

  return (
    <section id="templates" className="templates-section">
      <div className="section-header">
        <p className="section-label">Our Collection</p>
        <h2 className="section-title">Beautiful Templates for Every Love Story</h2>
        <p className="section-subtitle">
          Choose from our handcrafted collection of stunning invitation designs, 
          each thoughtfully created to capture the unique essence of your celebration.
        </p>
      </div>

      <div className="templates-actions">
        <div className="filter-chips" role="tablist" aria-label="Template categories">
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
        <div className="template-search">
          <input
            type="search"
            placeholder="Search templates"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
        </div>
      </div>

      <div className="templates-carousel-wrapper">
        <div className="templates-grid">
          {filteredTemplates.map((template) => {
            const OrnamentComponent = template.Ornament;
            return (
              <div
                key={template.id}
                className={`template-card ${template.className}`}
                onMouseEnter={() => trackTemplateView(template.id)}
              >
                <div className="template-preview">
                  <div className="template-inner">
                    <div className="template-ornament" style={{ color: template.ornamentColor }}>
                      <OrnamentComponent />
                    </div>
                    <div className="template-names">{template.names}</div>
                    <div className="template-date">{template.date}</div>
                    <div className="template-ornament" style={{ color: template.ornamentColor, transform: 'rotate(180deg)' }}>
                      <OrnamentComponent />
                    </div>
                  </div>
                </div>
                <div className="template-overlay">
                  <div className="template-highlights">
                    {template.features.map((feature) => (
                      <span key={feature} className="template-pill">{feature}</span>
                    ))}
                  </div>
                  <div className="template-actions">
                    <button 
                      className="template-overlay-btn"
                      onClick={() => handleCustomize(template)}
                    >
                      Customize This Design
                    </button>
                    <button 
                      className="template-overlay-secondary"
                      onClick={() => handleDemo(template)}
                    >
                      View Demo
                    </button>
                  </div>
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-desc">{template.description}</p>
                  <div className="template-meta">
                    <span className="template-tag">{template.category}</span>
                    {template.tags?.map((tag) => (
                      <span key={tag} className="template-tag badge">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {demoTemplate && (
        <div
          className="template-demo-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDemoTemplate(null);
          }}
        >
          <div className="template-demo-content">
            <div className="template-demo-header">
              <div>
                <p className="section-label">Live preview</p>
                <h3>{demoTemplate.name}</h3>
                <p className="template-desc">{demoTemplate.description}</p>
              </div>
              <button className="close-btn" aria-label="Close preview" onClick={() => setDemoTemplate(null)}>×</button>
            </div>
            <div className="template-demo-body">
              <div className={`template-card ${demoTemplate.className} demo-mode`}>
                <div className="template-preview">
                  <div className="template-inner">
                    <div className="template-ornament" style={{ color: demoTemplate.ornamentColor }}>
                      <demoTemplate.Ornament />
                    </div>
                    <div className="template-names">{demoTemplate.names}</div>
                    <div className="template-date">{demoTemplate.date}</div>
                    <div className="template-ornament" style={{ color: demoTemplate.ornamentColor, transform: 'rotate(180deg)' }}>
                      <demoTemplate.Ornament />
                    </div>
                  </div>
                </div>
              </div>
              <div className="template-demo-actions">
                <button className="cta-primary" onClick={() => handleCustomize(demoTemplate)}>
                  Start with this template
                </button>
                <button className="cta-secondary" onClick={() => setDemoTemplate(null)}>
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

export default TemplateShowcase;
