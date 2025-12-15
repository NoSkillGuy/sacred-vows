import { useState, useEffect } from 'react';
import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';

/**
 * EditableEditorialHero - WYSIWYG editable version of Editorial Hero
 * Supports image or video background editing
 */
function EditableEditorialHero({ translations, currentLang, config = {}, onUpdate }) {
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = config.wedding || {};
  const hero = config.hero || {};
  const venue = wedding.venue || {};
  
  const brideName = bride.name || 'Bride';
  const groomName = groom.name || 'Groom';
  const weddingDate = wedding.dates?.[0] || 'Date TBD';
  const city = venue.city || 'City';
  
  const alignment = hero.alignment || 'center';
  const mediaType = hero.mediaType || 'image';
  const mainImage = hero.mainImage || '/assets/hero-default.jpg';
  const videoUrl = hero.videoUrl || '';
  const videoPoster = hero.videoPoster || mainImage;
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();
  };
  
  return (
    <section className="ee-hero" data-alignment={alignment}>
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
          <EditableImage
            src={mainImage}
            alt={`${brideName} & ${groomName}`}
            className="ee-hero-image"
            onUpdate={onUpdate}
            path="hero.mainImage"
          />
        )}
        <div className="ee-hero-overlay" />
      </div>
      
      {/* Hero Content */}
      <div className="ee-hero-content">
        <div className="ee-hero-text">
          <h1 className="ee-hero-names">
            <EditableText
              value={brideName}
              onUpdate={onUpdate}
              path="couple.bride.name"
              tag="span"
              inline={true}
            />
            {' & '}
            <EditableText
              value={groomName}
              onUpdate={onUpdate}
              path="couple.groom.name"
              tag="span"
              inline={true}
            />
          </h1>
          <div className="ee-divider" />
          <p className="ee-meta-text ee-hero-date">
            {formatDate(weddingDate)}
          </p>
          <p className="ee-meta-text ee-hero-location">
            <EditableText
              value={city}
              onUpdate={onUpdate}
              path="wedding.venue.city"
              tag="span"
              inline={true}
            />
          </p>
        </div>
        
        <div className="ee-scroll-indicator">
          <span className="ee-scroll-line" />
        </div>
      </div>
    </section>
  );
}

export default EditableEditorialHero;

