import { useState, useEffect } from 'react';

function Hero({ onRSVPClick, translations, currentLang, config = {} }) {
  const [countdown, setCountdown] = useState('');
  
  // Get config values without template-specific defaults
  const wedding = config.wedding || {};
  const countdownTarget = wedding.countdownTarget;
  const heroImage = config.hero?.mainImage;
  const couple = config.couple || {};
  const brideName = couple.bride?.name || '';
  const groomName = couple.groom?.name || '';

  useEffect(() => {
    if (!countdownTarget) {
      setCountdown('');
      return;
    }

    const target = new Date(countdownTarget);
    if (Number.isNaN(target.getTime())) {
      setCountdown('');
      return;
    }

    const update = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(translations['countdown.today'] || '');
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

  const namesText = translations['hero.names'] || (brideName || groomName ? `${brideName} & ${groomName}` : '');
  const heroNames = namesText ? namesText.replace('&', '<span class="hero-amp">&amp;</span>') : '';

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">{translations['hero.eyebrow'] || ''}</div>
          <div className="hero-script">{translations['hero.script'] || ''}</div>

          <div className="hero-names" dangerouslySetInnerHTML={{ __html: heroNames }} />

          <div className="hero-sub">
            {translations['hero.sub'] || ''}
          </div>

          <div className="hero-date">
            {translations['hero.date'] || wedding.dates?.join(' & ')}
          </div>
          <div className="hero-location">
            {translations['hero.location'] || wedding.venue?.fullAddress}
          </div>

          <div className="hero-divider"></div>

          <div className="hero-countdown">
            <div className="hero-count-label">{translations['hero.countdown'] || ''}</div>
            <div className="hero-countdown-values" id="countdown">
              {countdown}
            </div>
          </div>

          <div className="hero-actions">
            <a href="#events" className="btn btn-primary">
              {translations['hero.actions.program'] || 'View Program Details'}
              <span className="btn-icon">↧</span>
            </a>
            <a href="#venue" className="btn btn-ghost">
              {translations['hero.actions.venue'] || 'View Venue & Directions'}
            </a>
            <button className="btn btn-primary" id="rsvpButtonHeader" onClick={onRSVPClick}>
              {translations['hero.actions.rsvp'] || 'RSVP Now'}
              <span className="btn-icon">✓</span>
            </button>
          </div>
        </div>

        <aside className="hero-photo-card">
          <div className="hero-photo-frame">
            <div className="hero-photo-inner">
              {heroImage ? (
                <img src={heroImage} alt={`${brideName} & ${groomName}`} loading="lazy" />
              ) : null}
            </div>
          </div>
          <div className="hero-photo-caption" dangerouslySetInnerHTML={{ __html: translations['hero.caption'] || '' }} />
        </aside>
      </div>
    </section>
  );
}

export default Hero;

