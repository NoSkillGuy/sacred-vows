import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import { getAllLayoutManifests } from '../../../services/layoutService';
import LayoutCardUnified from '../../Layouts/LayoutCardUnified';
import './LayoutsGalleryPage.css';

function LayoutsGalleryPage() {
  const [layouts, setLayouts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLayouts();
  }, []);

  async function loadLayouts() {
    try {
      setLoading(true);
      setError(null);
      const manifests = await getAllLayoutManifests();
      setLayouts(manifests || []);
    } catch (error) {
      console.error('Failed to load layouts', error);
      setError(error.message || 'Failed to load layouts. Please try again.');
      setLayouts([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const counts = new Map();
    layouts.forEach((layout) => {
      const category = layout.category || 'uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const items = Array.from(counts.entries()).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));

    return [{ id: 'all', name: 'All Layouts', count: layouts.length }, ...items];
  }, [layouts]);

  const filteredLayouts = activeCategory === 'all'
    ? layouts
    : layouts.filter(l => l.category === activeCategory);

  return (
    <PageLayout
      title="Wedding Invitation Layouts"
      subtitle="Browse our collection of beautifully designed layouts. Find the perfect style to tell your love story."
      breadcrumbs={[{ label: 'Layouts' }]}
    >
      <div className="layouts-gallery-page">
        {/* Category Filters */}
        <div className="layout-filters">
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
          <Link to="/layouts/traditional">Traditional</Link>
          <Link to="/layouts/modern">Modern</Link>
          <Link to="/layouts/minimal">Minimal</Link>
          <Link to="/layouts/floral">Floral</Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="gallery-error">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Layouts</h3>
            <p>{error}</p>
            <button className="page-btn page-btn-primary" onClick={loadLayouts}>
              Try Again
            </button>
          </div>
        )}

        {/* Layouts Grid */}
        {!error && (
          <div className="layouts-grid">
            {loading ? (
              <div className="layouts-loading">
                <div className="loading-spinner" />
                <p>Loading layouts...</p>
              </div>
            ) : filteredLayouts.length === 0 ? (
              <div className="gallery-empty">
                <div className="empty-icon">📄</div>
                <h3>No Layouts Available</h3>
                <p>There are no layouts available at the moment. Please check back later.</p>
              </div>
            ) : (
              filteredLayouts.map(layout => {
                const isReady = layout.status === 'ready' || layout.isAvailable;
                const badge = !isReady ? 'Coming Soon' : (layout.isFeatured ? 'Featured' : null);

                return (
                  <LayoutCardUnified
                    key={layout.id}
                    layout={layout}
                    badgeOverride={badge}
                    onPrimaryAction={() => isReady && navigate('/signup')}
                    primaryLabel={isReady ? 'Use This Layout' : 'Coming Soon'}
                    primaryDisabled={!isReady}
                  />
                );
              })
            )}
          </div>
        )}

        {/* CTA Section */}
        <section className="layouts-cta">
          <h2>Ready to Create Your Invitation?</h2>
          <p>Sign up free and start customizing your perfect layout today.</p>
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

export default LayoutsGalleryPage;

