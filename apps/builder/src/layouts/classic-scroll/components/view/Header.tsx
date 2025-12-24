import { useState, useEffect, useRef } from "react";

function Header({ onLanguageClick, translations, currentLang, config = {} }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Get config values with fallbacks
  const branding = config.branding || {};
  const music = config.music || {};
  const monogram = branding.monogram || "";
  const logo = branding.logo;
  const title = branding.title || "";
  const subtitle = branding.subtitle || "";
  const musicFile = music.file;
  const musicVolume = typeof music.volume === "number" ? music.volume : 0.5;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicFile) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Try autoplay
    audio.volume = musicVolume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [musicVolume]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || !musicFile) return;

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
          <div className="brand-monogram">
            {logo ? <img src={logo} alt={monogram || "Monogram"} /> : monogram}
          </div>
          <div className="brand-text">
            <div className="brand-title">{title}</div>
            <div className="brand-sub">{subtitle}</div>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#top">{translations["nav.home"] || "Home"}</a>
          <a href="#couple">{translations["nav.couple"] || "Couple"}</a>
          <a href="#gallery">{translations["nav.photos"] || "Photos"}</a>
          <a href="#events">{translations["nav.program"] || "Program"}</a>
          <a href="#venue">{translations["nav.venue"] || "Venue"}</a>
          <a href="#rsvp">{translations["nav.rsvp"] || "RSVP"}</a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="language-switcher"
            id="languageSwitcher"
            onClick={onLanguageClick}
            title="Change Language"
            aria-label="Change Language"
          >
            🌐
          </button>
          <div className="music-toggle" id="musicToggle" onClick={toggleMusic}>
            <div className={`music-dot ${isPlaying ? "on" : ""}`} id="musicDot"></div>
            <span>
              {isPlaying
                ? translations["music.pause"] || "Pause Music"
                : translations["music.play"] || "Play Music"}
            </span>
          </div>
        </div>
      </div>
      {musicFile ? (
        <audio ref={audioRef} id="bg-music" loop>
          <source src={musicFile} type="audio/mpeg" />
        </audio>
      ) : null}
    </header>
  );
}

export default Header;
