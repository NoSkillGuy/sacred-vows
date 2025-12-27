/**
 * Travel - City intro, curated hotel cards, "Editor's picks" tone
 * Especially important for destination weddings
 */
function Travel({ _translations, _currentLang, config = {} }) {
  const travel = config.travel || {};
  const cityIntro = travel.cityIntro || "";
  const hotels = travel.hotels || [];

  return (
    <section className="ee-section ee-travel-section">
      <div className="ee-travel-container">
        <h2 className="ee-section-heading">Travel & Stay</h2>
        <div className="ee-divider" />

        {/* City Introduction */}
        {cityIntro && <p className="ee-travel-intro">{cityIntro}</p>}

        {/* Curated Hotel Cards */}
        {hotels.length > 0 && (
          <div className="ee-travel-hotels">
            {hotels.map((hotel, index) => (
              <div key={index} className="ee-hotel-card">
                <h3 className="ee-hotel-name">{hotel.name || ""}</h3>
                {hotel.description && <p className="ee-hotel-description">{hotel.description}</p>}
                {hotel.address && <p className="ee-hotel-address">{hotel.address}</p>}
                {hotel.website && (
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ee-link"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Travel;
