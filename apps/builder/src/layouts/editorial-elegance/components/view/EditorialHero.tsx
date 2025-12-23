import { useState, useEffect } from 'react';
import { formatWeddingDate } from '../../utils/dateFormatter';
import { useParallax } from '../../hooks/useScrollAnimations';
import { getDefaultAssetUrl } from '../../../../services/defaultAssetService';

/**
 * EditorialHero - Magazine cover style hero section
 * Supports image or muted video background
 */
function EditorialHero({ translations, currentLang, config = {} }) {
  const heroRef = useParallax();
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = config.wedding || {};
  const hero = config.hero || {};
  
  const brideName = bride.name || 'Bride';
  const groomName = groom.name || 'Groom';
  const weddingDate = wedding.dates?.[0] || 'Date TBD';
  const venue = wedding.venue || {};
  const city = venue.city || 'City';
  
  // Hero config
  const alignment = hero.alignment || 'center'; // 'center' | 'bottom-left'
  const mediaType = hero.mediaType || 'image'; // 'image' | 'video'
  const mainImage = hero.mainImage || getDefaultAssetUrl('couple2', 'couple', '1.jpeg');
  const videoUrl = hero.videoUrl || '';
  const videoPoster = hero.videoPoster || mainImage;
  
  return (
    <section ref={heroRef} className="ee-hero" data-alignment={alignment}>
      {/* Background Media */}
      <div className="ee-hero-media">
        {mediaType === 'video' && videoUrl ? (
          <video
            className="ee-hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster={videoPoster}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={mainImage} 
            alt={`${brideName} & ${groomName}`}
            className="ee-hero-image"
          />
        )}
        <div className="ee-hero-overlay" />
      </div>
      
      {/* Hero Content */}
      <div className="ee-hero-content">
        <div className="ee-hero-text">
          <h1 className="ee-hero-names">
            {brideName} & {groomName}
          </h1>
          <div className="ee-divider" />
          {formatWeddingDate(weddingDate) && (
            <p className="ee-meta-text ee-hero-date">
              {formatWeddingDate(weddingDate)}
            </p>
          )}
          <p className="ee-meta-text ee-hero-location">
            {city}
          </p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="ee-scroll-indicator">
          <span className="ee-scroll-line" />
        </div>
      </div>
    </section>
  );
}

export default EditorialHero;

