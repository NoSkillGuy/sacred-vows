import EditableText from "../shared/EditableText";

/**
 * EditableTravel - Hotel cards editor, city intro text
 */
function EditableTravel({ _translations, _currentLang, config = {}, onUpdate }) {
  const travel = config.travel || {};
  const cityIntro = travel.cityIntro || "";
  const hotels = travel.hotels || [];

  const handleAddHotel = () => {
    const newHotels = [...hotels, { name: "", description: "", address: "", website: "" }];
    if (onUpdate) {
      onUpdate("travel.hotels", newHotels);
    }
  };

  const handleUpdateHotel = (index, field, value) => {
    const updated = [...hotels];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("travel.hotels", updated);
    }
  };

  return (
    <section className="ee-section ee-travel-section">
      <div className="ee-travel-container">
        <h2 className="ee-section-heading">Travel & Stay</h2>
        <div className="ee-divider" />

        {/* City Introduction */}
        <EditableText
          value={cityIntro}
          onUpdate={onUpdate}
          path="travel.cityIntro"
          className="ee-travel-intro"
          tag="p"
          multiline={true}
        />

        {/* Curated Hotel Cards */}
        <div className="ee-travel-hotels">
          {hotels.map((hotel, index) => (
            <div key={index} className="ee-hotel-card">
              <EditableText
                value={hotel.name || ""}
                onUpdate={(path, value) => handleUpdateHotel(index, "name", value)}
                className="ee-hotel-name"
                tag="h3"
              />
              <EditableText
                value={hotel.description || ""}
                onUpdate={(path, value) => handleUpdateHotel(index, "description", value)}
                className="ee-hotel-description"
                tag="p"
                multiline={true}
              />
              <EditableText
                value={hotel.address || ""}
                onUpdate={(path, value) => handleUpdateHotel(index, "address", value)}
                className="ee-hotel-address"
                tag="p"
              />
              <EditableText
                value={hotel.website || ""}
                onUpdate={(path, value) => handleUpdateHotel(index, "website", value)}
                className="ee-hotel-website"
                tag="a"
              />
            </div>
          ))}
          <button onClick={handleAddHotel} className="ee-add-button">
            + Add Hotel
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditableTravel;
