function Gallery({ translations, currentLang, config = {} }) {
  const gallery = config.gallery || {};
  const galleryImages = gallery.images || [
    { src: '/assets/photos/couple/2.jpeg', alt: 'Couple photo 1' },
    { src: '/assets/photos/family/3.jpeg', alt: 'Couple photo 2 (portrait)', orientation: 'portrait' },
    { src: '/assets/photos/couple/7.jpeg', alt: 'Friends and candid moment' },
    { src: '/assets/photos/couple/3.jpeg', alt: 'Traditional attire' },
    { src: '/assets/photos/couple/1.jpeg', alt: 'Favourite memory together' },
    { src: '/assets/photos/couple/8.jpeg', alt: 'Special capture' }
  ];

  return (
    <section id="gallery">
      <div className="section-header">
        <div className="section-eyebrow">{translations['gallery.eyebrow'] || 'Photo Story'}</div>
        <div className="section-title">{translations['gallery.title'] || 'Our Journey in Moments'}</div>
        <div className="section-subtitle">
          {translations['gallery.subtitle'] || 'A few glimpses from the memories and moments that bring us here today.'}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="gallery-grid">
            {galleryImages.map((img, index) => {
              const isPortrait = img.orientation === 'portrait' || /portrait/i.test(img.alt || '');
              return (
                <div key={index} className="gallery-item">
                  <div className={`gallery-inner${isPortrait ? ' tall' : ''}`}>
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

