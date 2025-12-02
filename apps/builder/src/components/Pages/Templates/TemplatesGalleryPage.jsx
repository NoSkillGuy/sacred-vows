import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './TemplatesGalleryPage.css';

// Template data
const templates = [
  {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    category: 'traditional',
    description: 'Timeless gold accents with classic styling',
    colors: ['#d4af37', '#fff8f0', '#f5e6d3'],
    popular: true
  },
  {
    id: 'eternal-bloom',
    name: 'Eternal Bloom',
    category: 'floral',
    description: 'Romantic florals in soft pink tones',
    colors: ['#e8b4b8', '#fef5f6', '#fde8ea'],
    popular: true
  },
  {
    id: 'midnight-romance',
    name: 'Midnight Romance',
    category: 'modern',
    description: 'Dramatic dark theme with gold accents',
    colors: ['#1a1a2e', '#d4af37', '#2a2a3d'],
    popular: false
  },
  {
    id: 'garden-dreams',
    name: 'Garden Dreams',
    category: 'floral',
    description: 'Fresh greenery with natural elegance',
    colors: ['#8fa88f', '#f5f9f5', '#e8f0e8'],
    popular: false
  },
  {
    id: 'classic-monogram',
    name: 'Classic Monogram',
    category: 'minimal',
    description: 'Clean lines with sophisticated simplicity',
    colors: ['#2c2c2c', '#ffffff', '#f5f5f5'],
    popular: false
  },
  {
    id: 'sunset-serenade',
    name: 'Sunset Serenade',
    category: 'modern',
    description: 'Warm sunset hues with modern flair',
    colors: ['#e6a87c', '#fff5eb', '#ffe4cc'],
    popular: true
  },
  {
    id: 'vintage-lace',
    name: 'Vintage Lace',
    category: 'traditional',
    description: 'Delicate lace patterns with vintage charm',
    colors: ['#d4c4b0', '#fffdf8', '#f5efe6'],
    popular: false
  },
  {
    id: 'modern-luxe',
    name: 'Modern Luxe',
    category: 'modern',
    description: 'Bold contemporary design with luxury touches',
    colors: ['#1a1a1a', '#c9a962', '#f8f8f8'],
    popular: false
  },
  {
    id: 'blush-botanicals',
    name: 'Blush Botanicals',
    category: 'floral',
    description: 'Soft blush tones with botanical illustrations',
    colors: ['#e8b4b8', '#f9f2f0', '#d4969c'],
    popular: true
  },
  {
    id: 'pure-simplicity',
    name: 'Pure Simplicity',
    category: 'minimal',
    description: 'Minimalist design with elegant typography',
    colors: ['#333333', '#ffffff', '#e8e8e8'],
    popular: false
  },
  {
    id: 'rustic-charm',
    name: 'Rustic Charm',
    category: 'traditional',
    description: 'Warm rustic elements with natural textures',
    colors: ['#8b6914', '#fdf8e8', '#e8dcc8'],
    popular: false
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    category: 'floral',
    description: 'Vibrant tropical leaves and exotic blooms',
    colors: ['#2e7d4a', '#f0fff4', '#c6f6d5'],
    popular: false
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: templates.length },
  { id: 'traditional', name: 'Traditional', count: templates.filter(t => t.category === 'traditional').length },
  { id: 'modern', name: 'Modern', count: templates.filter(t => t.category === 'modern').length },
  { id: 'minimal', name: 'Minimal', count: templates.filter(t => t.category === 'minimal').length },
  { id: 'floral', name: 'Floral', count: templates.filter(t => t.category === 'floral').length }
];

function TemplatesGalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

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
          {filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              {template.popular && (
                <div className="popular-badge">Popular</div>
              )}
              
              <div className="template-preview">
                <div 
                  className="template-inner"
                  style={{
                    background: `linear-gradient(180deg, ${template.colors[1]} 0%, ${template.colors[2]} 100%)`,
                    borderColor: template.colors[0]
                  }}
                >
                  <div className="template-ornament" style={{ color: template.colors[0] }}>✦</div>
                  <div className="template-names">Sarah & Michael</div>
                  <div className="template-date" style={{ color: template.colors[0] }}>
                    December 15, 2025
                  </div>
                </div>
              </div>

              <div className="template-overlay">
                <button 
                  className="preview-btn"
                  onClick={() => navigate('/signup')}
                >
                  Use This Template
                </button>
              </div>

              <div className="template-info">
                <div className="template-colors">
                  {template.colors.map((color, i) => (
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
          ))}
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

