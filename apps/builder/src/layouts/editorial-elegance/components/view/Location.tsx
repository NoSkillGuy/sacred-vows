/**
 * Location - Venue details with desaturated embedded map
 */
function Location({ translations, currentLang, config = {} }) {
  const wedding = config.wedding || {};
  const venue = wedding.venue || {};
  const mapStyle = config.location?.mapStyle || "desaturated";

  // Use default venue if none provided
  const displayVenue = {
    name: venue.name || "Halcyon Hotel Residences",
    address: venue.address || "",
    city: venue.city || "",
    state: venue.state || "",
    mapsUrl: venue.mapsUrl || "https://maps.app.goo.gl/s2JsPaRY3z6DbVkV6",
    mapsEmbedUrl: venue.mapsEmbedUrl || "",
  };

  return (
    <section className="ee-section ee-location-section">
      <div className="ee-location-container">
        {/* Venue Details */}
        <div className="ee-location-details">
          <p className="ee-meta-text">THE CEREMONY</p>
          <h2 className="ee-section-heading">{displayVenue.name}</h2>
          <div className="ee-divider" style={{ margin: "var(--ee-space-sm) 0" }} />
          {(displayVenue.address || displayVenue.city) && (
            <p className="ee-location-address">
              {displayVenue.address && (
                <>
                  {displayVenue.address}
                  <br />
                </>
              )}
              {displayVenue.city && displayVenue.state
                ? `${displayVenue.city}, ${displayVenue.state}`
                : displayVenue.city || displayVenue.state}
            </p>
          )}
          {displayVenue.mapsUrl && (
            <a
              href={displayVenue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ee-link ee-map-link"
            >
              Open in Maps →
            </a>
          )}
        </div>

        {/* Embedded Map */}
        <div className={`ee-location-map ee-map-${mapStyle}`}>
          {displayVenue.mapsEmbedUrl ? (
            <iframe
              src={displayVenue.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map to ${displayVenue.name}`}
            />
          ) : (
            <div className="ee-map-placeholder">
              <p>Map will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Location;
