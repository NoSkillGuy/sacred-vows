function Venue({ translations, currentLang, config = {} }) {
  const wedding = config.wedding || {};
  const venue = wedding.venue || {};

  const venueName = venue.name || "Royal Lotus View Resotel";
  const venueAddress =
    venue.address ||
    "Royal Lotus View Resotel,\nKempegowda, International Airport Road,\nPO, behind ITC Factory,\nChikkajala, Tharabanahalli,\nBengaluru, Karnataka 562157";
  const venueTags = venue.tags || ["Bengaluru, Karnataka", "Near Kempegowda International Airport"];
  const mapsUrl = venue.mapsUrl || "https://maps.app.goo.gl/pmjNuaGXQwdzSe6X6";
  const mapsEmbedUrl =
    venue.mapsEmbedUrl ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.234567890!2d77.6336814!3d13.1880748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1f47ee285e73%3A0x2fb4085d618d38a8!2sRoyal+Lotus+View+Resotel!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

  // Get custom translations - handle nested paths
  const getTranslation = (key) => {
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split(".");
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return customValue || translations[key] || "";
  };

  return (
    <section id="venue">
      <div className="section-header">
        <div className="section-eyebrow">{getTranslation("venue.eyebrow") || "Venue"}</div>
        <div className="section-title">{getTranslation("venue.title") || "Where to Join Us"}</div>
        <div className="section-subtitle">
          {getTranslation("venue.subtitle") ||
            "A serene and elegant venue to witness the beginning of a lifetime of togetherness."}
        </div>
      </div>

      <div className="card">
        <div className="card-inner venue-grid">
          <div>
            <h3 className="headline">{venueName}</h3>
            <p className="venue-address" style={{ whiteSpace: "pre-line" }}>
              {venueAddress}
            </p>

            <div className="chip-row">
              {venueTags.map((tag, index) => (
                <div key={index} className="chip">
                  {tag}
                </div>
              ))}
            </div>

            <p className="muted" style={{ marginBottom: "14px" }}>
              {getTranslation("venue.arrive") ||
                "Kindly arrive a little early to comfortably join us for the ceremonies. Our families eagerly await to welcome you with warmth and love."}
            </p>

            <a className="btn btn-primary" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              {getTranslation("venue.maps") || "Open in Google Maps"}
              <span className="btn-icon">➚</span>
            </a>
          </div>

          <div className="map-card" aria-label="Venue map preview">
            <iframe
              className="map-embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsEmbedUrl}
              title="Venue Location"
            ></iframe>
            <div className="map-footer">
              <span>Tap below to open the venue in your Maps.</span>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                View full map ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Venue;
