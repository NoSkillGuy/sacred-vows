import { useState, useEffect, useRef } from 'react';

function Header({ onLanguageClick, translations, currentLang }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Try autoplay
    audio.volume = 0.5;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-monogram">P&S</div>
          <div className="brand-text">
            <div className="brand-title">CAPT DR. PRIYA & DR. SAURABH</div>
            <div className="brand-sub">22 & 23 JANUARY 2026 · BENGALURU</div>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#top">{translations['nav.home'] || 'Home'}</a>
          <a href="#couple">{translations['nav.couple'] || 'Couple'}</a>
          <a href="#gallery">{translations['nav.photos'] || 'Photos'}</a>
          <a href="#events">{translations['nav.program'] || 'Program'}</a>
          <a href="#venue">{translations['nav.venue'] || 'Venue'}</a>
          <a href="#rsvp">{translations['nav.rsvp'] || 'RSVP'}</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="language-switcher"
            onClick={onLanguageClick}
            title="Change Language"
            aria-label="Change Language"
          >
            🌐
          </button>
          <div className="music-toggle" onClick={toggleMusic}>
            <div className={`music-dot ${isPlaying ? 'on' : ''}`}></div>
            <span>{isPlaying ? (translations['music.pause'] || 'Pause Music') : (translations['music.play'] || 'Play Music')}</span>
          </div>
        </div>
      </div>
      <audio ref={audioRef} id="bg-music" loop>
        <source src="/assets/music/1.mp3" type="audio/mpeg" />
      </audio>
    </header>
  );
}

export default Header;

