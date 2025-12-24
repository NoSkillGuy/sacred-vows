import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

function Gallery({ translations, _currentLang, config = {} }) {
  const gallery = config.gallery || {};
  const galleryImages = gallery.images || [
    {
      src: getDefaultAssetUrl("couple1", "couple", "21.jpeg"),
      alt: "Couple photo 1",
      orientation: "portrait",
    },
    {
      src: getDefaultAssetUrl("couple1", "family", "22.jpeg"),
      alt: "Couple photo 2 (portrait)",
      orientation: "portrait",
    },
    {
      src: getDefaultAssetUrl("couple1", "couple", "23.jpeg"),
      alt: "Friends and candid moment",
      orientation: "portrait",
    },
    {
      src: getDefaultAssetUrl("couple1", "couple", "24.jpeg"),
      alt: "Traditional attire",
      orientation: "portrait",
    },
    {
      src: getDefaultAssetUrl("couple1", "couple", "25.jpeg"),
      alt: "Favourite memory together",
      orientation: "portrait",
    },
    {
      src: getDefaultAssetUrl("couple1", "couple", "26.jpeg"),
      alt: "Special capture",
      orientation: "portrait",
    },
  ];

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
    <section id="gallery">
      <div className="section-header">
        <div className="section-eyebrow">{getTranslation("gallery.eyebrow") || "Photo Story"}</div>
        <div className="section-title">
          {getTranslation("gallery.title") || "Our Journey in Moments"}
        </div>
        <div className="section-subtitle">
          {getTranslation("gallery.subtitle") ||
            "A few glimpses from the memories and moments that bring us here today."}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="gallery-grid">
            {galleryImages.map((img, index) => {
              const isPortrait = img.orientation === "portrait" || /portrait/i.test(img.alt || "");
              return (
                <div key={index} className="gallery-item">
                  <div className={`gallery-inner${isPortrait ? " tall" : ""}`}>
                    <img src={img.src} alt={img.alt} loading="lazy" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;
