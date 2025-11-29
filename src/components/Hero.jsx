import { useState, useEffect } from 'react';

function Hero({ onRSVPClick, translations, currentLang }) {
  const [countdown, setCountdown] = useState('Loading...');

  useEffect(() => {
    const target = new Date('2026-01-23T21:00:00');

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
  }, [translations]);

  const heroNames = (translations['hero.names'] || 'CAPT DR. PRIYA & DR. SAURABH').replace('&', '<span class="hero-amp">&amp;</span>');

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">{translations['hero.eyebrow'] || 'THE WEDDING OF'}</div>
          <div className="hero-script">{translations['hero.script'] || 'With the blessings of our families'}</div>

          <div className="hero-names" dangerouslySetInnerHTML={{ __html: heroNames }} />

          <div className="hero-sub">
            {translations['hero.sub'] || 'TWO HEARTS, ONE DESTINY'}
          </div>

          <div className="hero-date">
            {translations['hero.date'] || '22 & 23 JANUARY 2026'}
          </div>
          <div className="hero-location">
            {translations['hero.location'] || 'ROYAL LOTUS VIEW RESOTEL · BENGALURU, KARNATAKA'}
          </div>

          <div className="hero-divider"></div>

          <div className="hero-countdown">
            <div className="hero-count-label">{translations['hero.countdown'] || 'COUNTDOWN TO WEDDING'}</div>
            <div className="hero-countdown-values">
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
            <button className="btn btn-primary" onClick={onRSVPClick}>
              {translations['hero.actions.rsvp'] || 'RSVP Now'}
              <span className="btn-icon">✓</span>
            </button>
          </div>
        </div>

        <aside className="hero-photo-card">
          <div className="hero-photo-frame">
            <div className="hero-photo-inner">
              <img src="/assets/photos/couple/1.jpeg" alt="Capt Dr. Priya & Dr. Saurabh" loading="lazy" />
            </div>
          </div>
          <div className="hero-photo-caption" dangerouslySetInnerHTML={{ __html: translations['hero.caption'] || 'A glimpse of <strong>Capt Dr. Priya & Dr. Saurabh</strong> as they begin their forever.' }} />
        </aside>
      </div>
    </section>
  );
}

export default Hero;

