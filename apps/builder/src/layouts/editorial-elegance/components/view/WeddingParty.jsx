/**
 * WeddingParty - Bride, Groom, and optional party members
 * Black & white photos recommended
 */
function WeddingParty({ translations, currentLang, config = {} }) {
  const weddingParty = config.weddingParty || {};
  const bride = weddingParty.bride || config.couple?.bride;
  const groom = weddingParty.groom || config.couple?.groom;
  const members = weddingParty.members || [];
  const showBios = weddingParty.showBios || false;
  const filter = weddingParty.filter || 'none'; // 'none' | 'bw'
  
  if (!bride && !groom) return null;
  
  const allMembers = [
    bride && { ...bride, title: 'THE BRIDE' },
    groom && { ...groom, title: 'THE GROOM' },
    ...members,
  ].filter(Boolean);
  
  return (
    <section className="ee-section ee-wedding-party-section">
      {/* Section Heading */}
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Wedding Party</h2>
        <div className="ee-divider" />
      </div>
      
      {/* Party Grid */}
      <div className="ee-party-grid">
        {allMembers.map((member, index) => (
          <div key={index} className="ee-party-member">
            <div className={`ee-party-image-wrapper ee-filter-${filter}`}>
              <img 
                src={member.image} 
                alt={member.name}
                className="ee-party-image"
              />
            </div>
            <p className="ee-meta-text ee-party-title">{member.title}</p>
            <h3 className="ee-party-name">{member.name}</h3>
            {showBios && member.bio && (
              <p className="ee-party-bio">{member.bio}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeddingParty;

