import { useState, useEffect } from 'react';

function Hero({ onRSVPClick, translations, currentLang, config = {} }) {
  const [countdown, setCountdown] = useState('Loading...');
  
  // Get config values with fallbacks - read directly from config on every render
  // This ensures we always get the latest values, especially customTranslations
  const wedding = config?.wedding || {};
  const countdownTarget = wedding?.countdownTarget || '2026-01-23T21:00:00';
  const heroImage = config?.hero?.mainImage || '/assets/photos/couple/1.jpeg';
  const couple = config?.couple || {};
  const brideName = couple?.bride?.name || 'Capt Dr. Priya Singh';
  const groomName = couple?.groom?.name || 'Dr. Saurabh Singh';
  
  // Get custom translations from config - read directly to ensure freshness
  // Handle nested paths like 'hero.eyebrow' -> customTranslations.hero.eyebrow
  const getTranslation = (key) => {
    // Check custom translations first - handle nested paths
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split('.');
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    
    // Fall back to default translations
    const defaultValue = translations[key] || '';
    return customValue || defaultValue;
  };

  useEffect(() => {
    const target = new Date(countdownTarget);

    const update = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(translations['countdown.today'] || 'Today we humbly celebrate this blessed union.');
        return;
      }

      const seconds = Math.floor(diff / 1000);
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      setCountdown(`${days}d • ${hours}h • ${minutes}m`);
    };

    update();
    const interval = setInterval(update, 60 * 1000);

    return () => clearInterval(interval);
  }, [translations, countdownTarget]);

  const heroNames = (getTranslation('hero.names') || `${brideName} & ${groomName}`).replace('&', '<span class="hero-amp">&amp;</span>');

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">{getTranslation('hero.eyebrow') || 'THE WEDDING OF'}</div>
          <div className="hero-script">{getTranslation('hero.script') || 'With the blessings of our families'}</div>

          <div className="hero-names" dangerouslySetInnerHTML={{ __html: heroNames }} />

          <div className="hero-sub">
            {getTranslation('hero.sub') || 'TWO HEARTS, ONE DESTINY'}
          </div>

          <div className="hero-date">
            {getTranslation('hero.date') || wedding.dates?.join(' & ') || '22 & 23 JANUARY 2026'}
          </div>
          <div className="hero-location">
            {getTranslation('hero.location') || wedding.venue?.fullAddress || 'ROYAL LOTUS VIEW RESOTEL · BENGALURU, KARNATAKA'}
          </div>

          <div className="hero-divider"></div>

          <div className="hero-countdown">
            <div className="hero-count-label">{getTranslation('hero.countdown') || 'COUNTDOWN TO WEDDING'}</div>
            <div className="hero-countdown-values">
              {countdown}
            </div>
          </div>

          <div className="hero-actions">
            <a href="#events" className="btn btn-primary">
              {getTranslation('hero.actions.program') || 'View Program Details'}
              <span className="btn-icon">↧</span>
            </a>
            <a href="#venue" className="btn btn-ghost">
              {getTranslation('hero.actions.venue') || 'View Venue & Directions'}
            </a>
            <button className="btn btn-primary" onClick={onRSVPClick}>
              {getTranslation('hero.actions.rsvp') || 'RSVP Now'}
              <span className="btn-icon">✓</span>
            </button>
          </div>
        </div>

        <aside className="hero-photo-card">
          <div className="hero-photo-frame">
            <div className="hero-photo-inner">
              <img src={heroImage} alt={`${brideName} & ${groomName}`} loading="lazy" />
            </div>
          </div>
          <div className="hero-photo-caption" dangerouslySetInnerHTML={{ __html: getTranslation('hero.caption') || `A glimpse of <strong>${brideName} & ${groomName}</strong> as they begin their forever.` }} />
        </aside>
      </div>
    </section>
  );
}

export default Hero;

