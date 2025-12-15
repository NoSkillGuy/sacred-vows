/**
 * Location - Venue details with desaturated embedded map
 */
function Location({ translations, currentLang, config = {} }) {
  const wedding = config.wedding || {};
  const venue = wedding.venue || {};
  const mapStyle = config.location?.mapStyle || 'desaturated';
  
  if (!venue.name) return null;
  
  return (
    <section className="ee-section ee-location-section">
      <div className="ee-location-container">
        {/* Venue Details */}
        <div className="ee-location-details">
          <p className="ee-meta-text">THE CEREMONY</p>
          <h2 className="ee-section-heading">{venue.name}</h2>
          <div className="ee-divider" style={{ margin: 'var(--ee-space-sm) 0' }} />
          <p className="ee-location-address">
            {venue.address}<br />
            {venue.city}, {venue.state}
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
        
        {/* Embedded Map */}
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

export default Location;

