/**
 * WeddingParty - Bride, Groom, and optional party members
 * Black & white photos recommended
 */
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

function WeddingParty({ translations, currentLang, config = {} }) {
  const weddingParty = config.weddingParty || {};
  const couple = config.couple || {};
  const bride = weddingParty.bride ||
    couple.bride || { name: "Bride", image: getDefaultAssetUrl("couple2", "bride", "1.jpeg") };
  const groom = weddingParty.groom ||
    couple.groom || { name: "Groom", image: getDefaultAssetUrl("couple2", "groom", "1.jpeg") };
  const members = weddingParty.members || [];
  const showBios = weddingParty.showBios || false;
  const filter = weddingParty.filter || "bw"; // 'none' | 'bw'

  const allMembers = [
    bride && { ...bride, title: "THE BRIDE" },
    groom && { ...groom, title: "THE GROOM" },
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
              <img src={member.image} alt={member.name} className="ee-party-image" />
            </div>
            <p className="ee-meta-text ee-party-title">{member.title}</p>
            <h3 className="ee-party-name">{member.name}</h3>
            {showBios && member.bio && <p className="ee-party-bio">{member.bio}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeddingParty;
