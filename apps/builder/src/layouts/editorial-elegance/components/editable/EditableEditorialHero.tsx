// useState, useEffect removed - unused
import EditableText from "../shared/EditableText";
import EditableImage from "../shared/EditableImage";
import EditableDate from "../shared/EditableDate";

/**
 * EditableEditorialHero - WYSIWYG editable version of Editorial Hero
 * Supports image or video background editing
 */
function EditableEditorialHero({ _translations, _currentLang, config = {}, onUpdate }) {
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = config.wedding || {};
  const hero = config.hero || {};
  const venue = wedding.venue || {};

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const weddingDate = wedding.dates?.[0] || "Date TBD";
  const city = venue.city || "City";

  const alignment = hero.alignment || "center";
  const mediaType = hero.mediaType || "image";
  const mainImage = hero.mainImage || "";
  const videoUrl = hero.videoUrl || "";
  const videoPoster = hero.videoPoster || mainImage;

  return (
    <section className="ee-hero" data-alignment={alignment}>
      {/* Background Media */}
      <div className="ee-hero-media">
        {mediaType === "video" && videoUrl ? (
          <video className="ee-hero-video" autoPlay muted loop playsInline poster={videoPoster}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <EditableImage
            src={mainImage}
            alt={`${brideName} & ${groomName}`}
            className="ee-hero-image"
            onUpdate={onUpdate}
            path="hero.mainImage"
          />
        )}
        <div className="ee-hero-overlay" />
      </div>

      {/* Hero Content */}
      <div className="ee-hero-content">
        <div className="ee-hero-text">
          <h1 className="ee-hero-names">
            <EditableText
              value={brideName}
              onUpdate={onUpdate}
              path="couple.bride.name"
              tag="span"
            />
            {" & "}
            <EditableText
              value={groomName}
              onUpdate={onUpdate}
              path="couple.groom.name"
              tag="span"
            />
          </h1>
          <div className="ee-divider" />
          <EditableDate
            value={weddingDate}
            onUpdate={onUpdate}
            path="wedding.dates.0"
            className="ee-meta-text ee-hero-date"
            placeholder="Click to set date..."
          />
          <EditableText
            value={city}
            onUpdate={onUpdate}
            path="wedding.venue.city"
            className="ee-meta-text ee-hero-location"
            tag="p"
          />
        </div>
      </div>
    </section>
  );
}

export default EditableEditorialHero;
