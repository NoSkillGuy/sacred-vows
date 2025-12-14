import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout';
import './LayoutsGalleryPage.css';

// Layout data organized by category
const layoutsByCategory = {
  traditional: {
    name: 'Traditional',
    description: 'Classic elegance meets timeless design. Our traditional layouts feature refined ornaments, elegant typography, and sophisticated color palettes that honor wedding traditions.',
    layouts: [
      {
        id: 'classic-scroll',
        name: 'Classic Scroll',
        description: 'Classic single-column vertical scroll with traditional elegance',
        colors: ['#d4af37', '#fff8f0', '#f5e6d3'],
        popular: true
      },
      {
        id: 'vintage-lace',
        name: 'Vintage Lace',
        description: 'Delicate lace patterns with vintage charm',
        colors: ['#d4c4b0', '#fffdf8', '#f5efe6'],
        popular: false
      },
      {
        id: 'rustic-charm',
        name: 'Rustic Charm',
        description: 'Warm rustic elements with natural textures',
        colors: ['#8b6914', '#fdf8e8', '#e8dcc8'],
        popular: false
      },
      {
        id: 'classic-ivory',
        name: 'Classic Ivory',
        description: 'Elegant ivory tones with gold accents',
        colors: ['#c9a962', '#fffff0', '#f5f0e1'],
        popular: true
      },
      {
        id: 'regal-burgundy',
        name: 'Regal Burgundy',
        description: 'Deep burgundy with royal gold details',
        colors: ['#8b2942', '#fff8f5', '#f5e8e8'],
        popular: false
      }
    ]
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary designs for the modern couple. Bold typography, clean lines, and innovative layouts that make a statement.',
    layouts: [
      {
        id: 'midnight-romance',
        name: 'Midnight Romance',
        description: 'Dramatic dark theme with gold accents',
        colors: ['#1a1a2e', '#d4af37', '#2a2a3d'],
        popular: true
      },
      {
        id: 'sunset-serenade',
        name: 'Sunset Serenade',
        description: 'Warm sunset hues with modern flair',
        colors: ['#e6a87c', '#fff5eb', '#ffe4cc'],
        popular: true
      },
      {
        id: 'modern-luxe',
        name: 'Modern Luxe',
        description: 'Bold contemporary design with luxury touches',
        colors: ['#1a1a1a', '#c9a962', '#f8f8f8'],
        popular: false
      },
      {
        id: 'geometric-love',
        name: 'Geometric Love',
        description: 'Clean geometric patterns with modern elegance',
        colors: ['#3d3d3d', '#ffffff', '#f0f0f0'],
        popular: false
      },
      {
        id: 'urban-chic',
        name: 'Urban Chic',
        description: 'City-inspired design with sophisticated style',
        colors: ['#2c3e50', '#ecf0f1', '#bdc3c7'],
        popular: false
      }
    ]
  },
  minimal: {
    name: 'Minimal',
    description: 'Less is more. Our minimal layouts focus on typography, whitespace, and subtle details for couples who appreciate refined simplicity.',
    layouts: [
      {
        id: 'classic-monogram',
        name: 'Classic Monogram',
        description: 'Clean lines with sophisticated simplicity',
        colors: ['#2c2c2c', '#ffffff', '#f5f5f5'],
        popular: true
      },
      {
        id: 'pure-simplicity',
        name: 'Pure Simplicity',
        description: 'Minimalist design with elegant typography',
        colors: ['#333333', '#ffffff', '#e8e8e8'],
        popular: false
      },
      {
        id: 'white-elegance',
        name: 'White Elegance',
        description: 'Pure white with delicate gray accents',
        colors: ['#6b6b6b', '#ffffff', '#fafafa'],
        popular: false
      },
      {
        id: 'modern-serif',
        name: 'Modern Serif',
        description: 'Typography-focused with classic fonts',
        colors: ['#1a1a1a', '#ffffff', '#f5f5f5'],
        popular: true
      },
      {
        id: 'quiet-luxury',
        name: 'Quiet Luxury',
        description: 'Understated elegance with subtle textures',
        colors: ['#4a4a4a', '#faf9f7', '#ebe9e4'],
        popular: false
      }
    ]
  },
  floral: {
    name: 'Floral',
    description: 'Nature-inspired beauty with romantic florals. From delicate watercolors to bold botanical prints, find the perfect floral design for your celebration.',
    layouts: [
      {
        id: 'eternal-bloom',
        name: 'Eternal Bloom',
        description: 'Romantic florals in soft pink tones',
        colors: ['#e8b4b8', '#fef5f6', '#fde8ea'],
        popular: true
      },
      {
        id: 'garden-dreams',
        name: 'Garden Dreams',
        description: 'Fresh greenery with natural elegance',
        colors: ['#8fa88f', '#f5f9f5', '#e8f0e8'],
        popular: true
      },
      {
        id: 'blush-botanicals',
        name: 'Blush Botanicals',
        description: 'Soft blush tones with botanical illustrations',
        colors: ['#e8b4b8', '#f9f2f0', '#d4969c'],
        popular: true
      },
      {
        id: 'tropical-paradise',
        name: 'Tropical Paradise',
        description: 'Vibrant tropical leaves and exotic blooms',
        colors: ['#2e7d4a', '#f0fff4', '#c6f6d5'],
        popular: false
      },
      {
        id: 'wildflower-meadow',
        name: 'Wildflower Meadow',
        description: 'Colorful wildflowers with bohemian charm',
        colors: ['#9b59b6', '#fdf2f8', '#e8b4d9'],
        popular: false
      },
      {
        id: 'peony-romance',
        name: 'Peony Romance',
        description: 'Lush peonies in romantic pink hues',
        colors: ['#d4969c', '#fff0f3', '#fce4e2'],
        popular: false
      }
    ]
  }
};

function LayoutCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const categoryData = layoutsByCategory[category];

  if (!categoryData) {
    return (
      <PageLayout
        title="Category Not Found"
        subtitle="The layout category you're looking for doesn't exist."
        breadcrumbs={[{ label: 'Layouts', path: '/layouts-gallery' }, { label: 'Not Found' }]}
      >
        <div className="layouts-gallery-page">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Link to="/layouts-gallery" className="page-btn page-btn-primary">
              View All Layouts
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${categoryData.name} Wedding Invitations`}
      subtitle={categoryData.description}
      breadcrumbs={[
        { label: 'Layouts', path: '/layouts-gallery' },
        { label: categoryData.name }
      ]}
    >
      <div className="layouts-gallery-page">
        {/* Category Navigation */}
        <div className="category-links">
          <p>Other styles:</p>
          {Object.entries(layoutsByCategory)
            .filter(([key]) => key !== category)
            .map(([key, value]) => (
              <Link key={key} to={`/layouts/${key}`}>
                {value.name}
              </Link>
            ))}
          <Link to="/layouts-gallery">All Layouts</Link>
        </div>

        {/* Layouts Grid */}
        <div className="layouts-grid">
          {categoryData.layouts.map(layout => (
            <div key={layout.id} className="layout-card">
              {layout.popular && (
                <div className="popular-badge">Popular</div>
              )}
              
              <div className="layout-preview">
                <div 
                  className="layout-inner"
                  style={{
                    background: `linear-gradient(180deg, ${layout.colors[1]} 0%, ${layout.colors[2]} 100%)`,
                    borderColor: layout.colors[0]
                  }}
                >
                  <div className="layout-ornament" style={{ color: layout.colors[0] }}>✦</div>
                  <div className="layout-names">Sarah & Michael</div>
                  <div className="layout-date" style={{ color: layout.colors[0] }}>
                    December 15, 2025
                  </div>
                </div>
              </div>

              <div className="layout-overlay">
                <button 
                  className="preview-btn"
                  onClick={() => navigate('/signup')}
                >
                  Use This Layout
                </button>
              </div>

              <div className="layout-info">
                <div className="layout-colors">
                  {layout.colors.map((color, i) => (
                    <span 
                      key={i} 
                      className="color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <h3>{layout.name}</h3>
                <p>{layout.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <section className="layouts-cta">
          <h2>Love These {categoryData.name} Designs?</h2>
          <p>Sign up free and start customizing your perfect layout today.</p>
          <div className="cta-buttons">
            <button 
              className="page-btn page-btn-primary"
              onClick={() => navigate('/signup')}
            >
              Start Creating Free
              <span>→</span>
            </button>
            <Link to="/layouts-gallery" className="page-btn page-btn-secondary">
              Browse All Layouts
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default LayoutCategoryPage;

