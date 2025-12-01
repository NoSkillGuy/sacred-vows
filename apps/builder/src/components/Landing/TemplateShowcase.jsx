import { useNavigate } from 'react-router-dom';

const templates = [
  {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    description: 'Classic gold and cream design',
    className: 'template-royal-elegance',
    ornament: '❧',
    names: 'Priya & Rahul',
    date: 'Dec 15, 2025',
  },
  {
    id: 'eternal-bloom',
    name: 'Eternal Bloom',
    description: 'Soft floral watercolor theme',
    className: 'template-eternal-bloom',
    ornament: '✿',
    names: 'Emma & James',
    date: 'June 8, 2025',
  },
  {
    id: 'midnight-romance',
    name: 'Midnight Romance',
    description: 'Dark elegant sophistication',
    className: 'template-midnight-romance',
    ornament: '✦',
    names: 'Sophia & William',
    date: 'Nov 22, 2025',
  },
  {
    id: 'garden-dreams',
    name: 'Garden Dreams',
    description: 'Botanical illustrations',
    className: 'template-garden-dreams',
    ornament: '🌿',
    names: 'Olivia & Liam',
    date: 'April 18, 2025',
  },
  {
    id: 'classic-monogram',
    name: 'Classic Monogram',
    description: 'Timeless minimal design',
    className: 'template-classic-monogram',
    ornament: '◆',
    names: 'Isabella & Noah',
    date: 'Sept 5, 2025',
  },
  {
    id: 'sunset-serenade',
    name: 'Sunset Serenade',
    description: 'Warm gradient aesthetics',
    className: 'template-sunset-serenade',
    ornament: '☀',
    names: 'Ava & Ethan',
    date: 'Aug 12, 2025',
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

      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className={`template-card ${template.className}`}>
            <div className="template-preview">
              <div className="template-inner">
                <div className="template-ornament">{template.ornament}</div>
                <div className="template-names">{template.names}</div>
                <div className="template-date">{template.date}</div>
                <div className="template-ornament">{template.ornament}</div>
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
        ))}
      </div>
    </section>
  );
}

export default TemplateShowcase;

