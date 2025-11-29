import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useLanguage } from '../../hooks/useLanguage';
import Header from '../Invitation/Header';
import Hero from '../Invitation/Hero';
import Couple from '../Invitation/Couple';
import FathersLetter from '../Invitation/FathersLetter';
import Gallery from '../Invitation/Gallery';
import Events from '../Invitation/Events';
import Venue from '../Invitation/Venue';
import RSVP from '../Invitation/RSVP';
import Footer from '../Invitation/Footer';
import ConfettiLayer from '../Invitation/ConfettiLayer';
import CelebrateButton from '../Invitation/CelebrateButton';
import RSVPModal from '../Invitation/RSVPModal';
import LanguageModal from '../Invitation/LanguageModal';
import GuestNameModal from '../Invitation/GuestNameModal';
import '../../styles/invitation.css';
import './PreviewPane.css';

function PreviewPane() {
  const currentInvitation = useBuilderStore((state) => state.currentInvitation);
  const { currentLang, translations, updateLanguage } = useLanguage();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);

  const handleRSVPClick = () => {
    setShowRSVPModal(true);
  };

  const handleLanguageClick = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (lang) => {
    localStorage.setItem('wedding-lang', lang);
    updateLanguage(lang);
    setShowLanguageModal(false);
  };

  return (
    <div className="preview-pane">
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-actions">
          <button className="preview-btn">Desktop</button>
          <button className="preview-btn">Tablet</button>
          <button className="preview-btn">Mobile</button>
        </div>
      </div>
      <div className="preview-content">
        <div className="preview-wrapper">
          <Header 
            onLanguageClick={handleLanguageClick}
            translations={translations}
            currentLang={currentLang}
            config={currentInvitation.data}
          />
          <main className="page-shell">
            <Hero 
              key={`hero-${currentInvitation.data?.couple?.bride?.name || ''}-${currentInvitation.data?.couple?.groom?.name || ''}`}
              onRSVPClick={handleRSVPClick}
              translations={translations}
              currentLang={currentLang}
              config={currentInvitation.data}
            />
            <Couple 
              translations={translations} 
              currentLang={currentLang} 
              config={currentInvitation.data}
            />
            <FathersLetter 
              translations={translations}
              currentLang={currentLang}
              config={currentInvitation.data}
            />
            <Gallery 
              translations={translations} 
              currentLang={currentLang} 
              config={currentInvitation.data}
            />
            <Events 
              translations={translations} 
              currentLang={currentLang} 
              config={currentInvitation.data}
            />
            <Venue 
              translations={translations} 
              currentLang={currentLang} 
              config={currentInvitation.data}
            />
            <RSVP 
              onRSVPClick={handleRSVPClick}
              translations={translations}
              currentLang={currentLang}
              config={currentInvitation.data}
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
            config={currentInvitation.data}
          />
        </div>
      </div>
    </div>
  );
}

export default PreviewPane;

