/**
 * EditorialIntro - Magazine opening paragraph
 * Two-column layout: text + portrait image
 */
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

function EditorialIntro({ translations, currentLang, config = {} }) {
  const editorialIntro = config.editorialIntro || {};
  const introText =
    editorialIntro.text ||
    "Two paths, one story.\nRooted in tradition, bound by love,\nwe invite you to celebrate the beginning of forever.";
  const introImage = editorialIntro.image || getDefaultAssetUrl("couple2", "couple", "2.jpeg");
  const alignment = editorialIntro.alignment || "right"; // 'left' | 'right'

  return (
    <section className="ee-section ee-editorial-intro-section">
      <div className={`ee-intro-container ee-intro-${alignment}`}>
        {/* Text Content */}
        <div className="ee-intro-text">
          <p className="ee-editorial-intro">{introText}</p>
        </div>

        {/* Portrait Image (or negative space) */}
        <div className="ee-intro-image-container">
          {introImage && <img src={introImage} alt="Couple portrait" className="ee-intro-image" />}
        </div>
      </div>
    </section>
  );
}

export default EditorialIntro;
