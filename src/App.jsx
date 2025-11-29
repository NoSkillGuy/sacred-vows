import { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FathersLetter from './components/FathersLetter';
import Gallery from './components/Gallery';
import Couple from './components/Couple';
import Events from './components/Events';
import Venue from './components/Venue';
import RSVP from './components/RSVP';
import Footer from './components/Footer';
import LanguageModal from './components/LanguageModal';
import GuestNameModal from './components/GuestNameModal';
import RSVPModal from './components/RSVPModal';
import ConfettiLayer from './components/ConfettiLayer';
import CelebrateButton from './components/CelebrateButton';
import { useLanguage } from './hooks/useLanguage';
import { registerServiceWorker } from './utils/serviceWorker';

function App() {
  const { currentLang, translations, updateLanguage } = useLanguage();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check if language is already set
    const savedLang = localStorage.getItem('wedding-lang');
    if (!savedLang) {
      setShowLanguageModal(true);
    } else {
      // Check if guest name is needed
      if (!localStorage.getItem('wedding-guest-name')) {
        setShowGuestNameModal(true);
      }
    }

    // Listen for language changes
    const handleLanguageChange = () => {
      const lang = localStorage.getItem('wedding-lang') || 'en';
      updateLanguage(lang);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('guestNameUpdated', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('guestNameUpdated', handleLanguageChange);
    };
  }, [updateLanguage]);

  const handleRSVPClick = () => {
    setShowRSVPModal(true);
  };

  const handleLanguageSelect = (lang) => {
    localStorage.setItem('wedding-lang', lang);
    updateLanguage(lang);
    setShowLanguageModal(false);
    if (!localStorage.getItem('wedding-guest-name')) {
      setShowGuestNameModal(true);
    }
  };

  return (
    <>
      <Header 
        onLanguageClick={() => setShowLanguageModal(true)}
        translations={translations}
        currentLang={currentLang}
      />
      <main className="page-shell">
        <Hero 
          onRSVPClick={handleRSVPClick}
          translations={translations}
          currentLang={currentLang}
        />
        <Couple translations={translations} currentLang={currentLang} />
        <FathersLetter 
          translations={translations}
          currentLang={currentLang}
        />
        <Gallery translations={translations} currentLang={currentLang} />
        <Events translations={translations} currentLang={currentLang} />
        <Venue translations={translations} currentLang={currentLang} />
        <RSVP 
          onRSVPClick={handleRSVPClick}
          translations={translations}
          currentLang={currentLang}
        />
        <Footer translations={translations} currentLang={currentLang} />
      </main>
      <ConfettiLayer />
      <CelebrateButton />
      <LanguageModal 
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelect={handleLanguageSelect}
        currentLang={currentLang}
        translations={translations}
      />
      <GuestNameModal 
        isOpen={showGuestNameModal}
        onClose={() => setShowGuestNameModal(false)}
        translations={translations}
        currentLang={currentLang}
      />
      <RSVPModal 
        isOpen={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
        translations={translations}
        currentLang={currentLang}
      />
    </>
  );
}

export default App;

