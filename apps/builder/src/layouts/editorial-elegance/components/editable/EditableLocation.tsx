import EditableText from "../shared/EditableText";

/**
 * EditableLocation - WYSIWYG editable Location
 */
function EditableLocation({ _translations, _currentLang, config = {}, onUpdate }) {
  const wedding = config.wedding || {};
  const venue = wedding.venue || {};
  const mapStyle = config.location?.mapStyle || "desaturated";

  if (!venue.name) return null;

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
          {venue.mapsEmbedUrl ? (
            <iframe
              src={venue.mapsEmbedUrl}
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
