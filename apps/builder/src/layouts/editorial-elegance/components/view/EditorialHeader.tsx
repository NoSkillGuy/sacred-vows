import { useState, useEffect, useRef } from "react";
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

/**
 * EditorialHeader - Minimal floating music control
 * Matches editorial elegance aesthetic with subtle design
 */
function EditorialHeader({ _translations, _currentLang, config = {} }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const music = config.music || {};
  const musicFile = music.file || getDefaultAssetUrl("music", null, "1.mp3");
  const musicVolume = typeof music.volume === "number" ? music.volume : 0.5;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicFile) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Set volume
    audio.volume = musicVolume;

    // Try autoplay (will fail silently if browser blocks)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked - user will need to interact
          setIsPlaying(false);
        });
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [musicFile, musicVolume]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || !musicFile) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  if (!musicFile) return null;

  return (
    <>
      <header className="ee-header">
        <button
          className="ee-music-toggle"
          onClick={toggleMusic}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          title={isPlaying ? "Pause music" : "Play music"}
        >
          <span className={`ee-music-icon ${isPlaying ? "ee-music-playing" : ""}`}>
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>
      </header>
      <audio ref={audioRef} loop>
        <source src={musicFile} type="audio/mpeg" />
      </audio>
    </>
  );
}

export default EditorialHeader;
