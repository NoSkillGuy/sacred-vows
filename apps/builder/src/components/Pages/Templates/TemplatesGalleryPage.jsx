import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import { getAllTemplateManifests } from '../../../services/templateService';
import './TemplatesGalleryPage.css';

const fallbackColors = {
  primary: '#d4af37',
  background: '#fff8f0',
  accent: '#c9a227',
};

function TemplatesGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const manifests = await getAllTemplateManifests();
      setTemplates(manifests || []);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const counts = new Map();
    templates.forEach((template) => {
      const category = template.category || 'uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const items = Array.from(counts.entries()).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));

    return [{ id: 'all', name: 'All Templates', count: templates.length }, ...items];
  }, [templates]);

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const resolveColors = (template) => {
    const defaultTheme = template.themes?.find((theme) => theme.isDefault) || template.themes?.[0];
    const colors = defaultTheme?.colors || {};
    return {
      primary: colors.primary || fallbackColors.primary,
      background: colors.background || fallbackColors.background,
      accent: colors.accent || colors.secondary || fallbackColors.accent,
    };
  };

  return (
    <PageLayout
      title="Wedding Invitation Templates"
      subtitle="Browse our collection of beautifully designed templates. Find the perfect style to tell your love story."
      breadcrumbs={[{ label: 'Templates' }]}
    >
      <div className="templates-gallery-page">
        {/* Category Filters */}
        <div className="template-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
              <span className="filter-count">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Category Links */}
        <div className="category-links">
          <p>Browse by style:</p>
          <Link to="/templates/traditional">Traditional</Link>
          <Link to="/templates/modern">Modern</Link>
          <Link to="/templates/minimal">Minimal</Link>
          <Link to="/templates/floral">Floral</Link>
        </div>

        {/* Templates Grid */}
        <div className="templates-grid">
          {loading ? (
            <div className="templates-loading">
              <div className="loading-spinner" />
              <p>Loading templates...</p>
            </div>
          ) : (
            filteredTemplates.map(template => {
              const { primary, background, accent } = resolveColors(template);
              const isReady = template.status === 'ready' || template.isAvailable;
              const badge = !isReady ? 'Coming Soon' : (template.isFeatured ? 'Featured' : null);

              return (
                <div key={template.id} className="template-card">
                  {badge && (
                    <div className={`popular-badge ${!isReady ? 'coming-soon' : ''}`}>{badge}</div>
                  )}
                  
                  <div className="template-preview">
                    <div 
                      className="template-inner"
                      style={{
                        background: `linear-gradient(180deg, ${background} 0%, ${accent} 100%)`,
                        borderColor: primary
                      }}
                    >
                      <div className="template-ornament" style={{ color: primary }}>✦</div>
                      <div className="template-names">Sarah & Michael</div>
                      <div className="template-date" style={{ color: primary }}>
                        December 15, 2025
                      </div>
                    </div>
                  </div>

                  <div className="template-overlay">
                    <button 
                      className="preview-btn"
                      onClick={() => isReady && navigate('/signup')}
                      disabled={!isReady}
                    >
                      {isReady ? 'Use This Template' : 'Coming Soon'}
                    </button>
                  </div>

                  <div className="template-info">
                    <div className="template-colors">
                      {[primary, background, accent].map((color, i) => (
                        <span 
                          key={i} 
                          className="color-dot"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <span className="template-category">{template.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA Section */}
        <section className="templates-cta">
          <h2>Ready to Create Your Invitation?</h2>
          <p>Sign up free and start customizing your perfect template today.</p>
          <div className="cta-buttons">
            <button 
              className="page-btn page-btn-primary"
              onClick={() => navigate('/signup')}
            >
              Start Creating Free
              <span>→</span>
            </button>
            <Link to="/pricing" className="page-btn page-btn-secondary">
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default TemplatesGalleryPage;

