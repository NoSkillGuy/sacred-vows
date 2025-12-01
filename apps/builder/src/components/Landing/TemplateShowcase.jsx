import { useNavigate } from 'react-router-dom';

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
  },
];

function TemplateShowcase() {
  const navigate = useNavigate();

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

      <div className="templates-carousel-wrapper">
        <div className="templates-grid">
          {templates.map((template) => {
            const OrnamentComponent = template.Ornament;
            return (
              <div key={template.id} className={`template-card ${template.className}`}>
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
                  <button 
                    className="template-overlay-btn"
                    onClick={() => navigate('/signup')}
                  >
                    Customize This Design
                  </button>
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-desc">{template.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TemplateShowcase;
