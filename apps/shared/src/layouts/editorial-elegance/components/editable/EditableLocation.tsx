import EditableText from "../shared/EditableText";

/**
 * EditableLocation - WYSIWYG editable Location
 */
function EditableLocation({ _translations, _currentLang, config = {}, onUpdate }) {
  const wedding = config.wedding || {};
  const venue = wedding.venue || {};
  const mapStyle = config.location?.mapStyle || "desaturated";

  // Generate embed URL from coordinates if not provided
  // Halcyon Hotel Residences coordinates: 12.935688, 77.631266
  const getEmbedUrl = (mapsUrl: string, mapsEmbedUrl: string): string => {
    if (mapsEmbedUrl) return mapsEmbedUrl;
    // Fallback: use coordinate-based embed URL for Halcyon Hotel Residences
    return "https://www.google.com/maps?q=12.935688,77.631266&hl=en&z=17&output=embed";
  };

  if (!venue.name) return null;

  const displayVenue = {
    ...venue,
    mapsEmbedUrl: getEmbedUrl(venue.mapsUrl || "", venue.mapsEmbedUrl || ""),
  };

  return (
    <section className="ee-section ee-location-section">
      <div className="ee-location-container">
        <div className="ee-location-details">
          <p className="ee-meta-text">THE CEREMONY</p>
          <EditableText
            value={venue.name}
            onUpdate={onUpdate}
            path="wedding.venue.name"
            className="ee-section-heading"
            tag="h2"
          />
          <div className="ee-divider" style={{ margin: "var(--ee-space-sm) 0" }} />
          <p className="ee-location-address">
            <EditableText
              value={venue.address}
              onUpdate={onUpdate}
              path="wedding.venue.address"
              tag="span"
            />
            <br />
            <EditableText
              value={venue.city}
              onUpdate={onUpdate}
              path="wedding.venue.city"
              tag="span"
            />
            {", "}
            <EditableText
              value={venue.state}
              onUpdate={onUpdate}
              path="wedding.venue.state"
              tag="span"
            />
          </p>
          {venue.mapsUrl && (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ee-link ee-map-link"
            >
              Open in Maps →
            </a>
          )}
        </div>

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
              title={`Map to ${venue.name}`}
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

export default EditableLocation;
