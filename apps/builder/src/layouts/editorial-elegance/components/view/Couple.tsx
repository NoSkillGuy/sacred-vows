/**
 * Couple - Minimal editorial section for bride and groom
 * Side-by-side layout with photos and names
 */
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

interface CoupleProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    couple?: {
      bride?: {
        name?: string;
        image?: string;
        parents?: {
          mother?: string;
          father?: string;
        };
      };
      groom?: {
        name?: string;
        image?: string;
        parents?: {
          mother?: string;
          father?: string;
        };
      };
    };
  };
}

function Couple({ _translations, _currentLang, config = {} }: CoupleProps) {
  const couple = config.couple || {};
  const bride = couple.bride || {
    name: "Bride",
    image: getDefaultAssetUrl("couple2", "bride", "1.jpeg"),
  };
  const groom = couple.groom || {
    name: "Groom",
    image: getDefaultAssetUrl("couple2", "groom", "1.jpeg"),
  };

  const brideMother = bride.parents?.mother || "Mrs. Geeta Singh";
  const brideFather = bride.parents?.father || "Mr. Sanjay Singh";
  const groomMother = groom.parents?.mother || "Mrs. Rayapudi Lakshmi";
  const groomFather = groom.parents?.father || "Mr. Rayapudi Sathi Raju";

  return (
    <section className="ee-section ee-couple-section">
      {/* Section Heading */}
      <div className="ee-section-header">
        <h2 className="ee-section-heading">The Couple</h2>
        <div className="ee-divider" />
      </div>

      {/* Couple Grid */}
      <div className="ee-couple-grid">
        {/* Bride */}
        <div className="ee-couple-member">
          <div className="ee-couple-image-wrapper">
            <img src={bride.image} alt={bride.name} className="ee-couple-image" />
          </div>
          <p className="ee-meta-text ee-couple-label">THE BRIDE</p>
          <h3 className="ee-couple-name">{bride.name}</h3>
          <div className="ee-couple-parents">
            <p className="ee-couple-parents-label">Daughter of</p>
            {brideMother && <p className="ee-couple-parent-name">{brideMother}</p>}
            {brideFather && <p className="ee-couple-parent-name">{brideFather}</p>}
          </div>
        </div>

        {/* Groom */}
        <div className="ee-couple-member">
          <div className="ee-couple-image-wrapper">
            <img src={groom.image} alt={groom.name} className="ee-couple-image" />
          </div>
          <p className="ee-meta-text ee-couple-label">THE GROOM</p>
          <h3 className="ee-couple-name">{groom.name}</h3>
          <div className="ee-couple-parents">
            <p className="ee-couple-parents-label">Son of</p>
            {groomMother && <p className="ee-couple-parent-name">{groomMother}</p>}
            {groomFather && <p className="ee-couple-parent-name">{groomFather}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Couple;
