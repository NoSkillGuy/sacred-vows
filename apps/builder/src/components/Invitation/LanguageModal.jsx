function LanguageModal({ isOpen, onClose, onSelect, currentLang, translations }) {
  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' }
  ];

  return (
    <div className="language-modal active" onClick={onClose}>
      <div className="language-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="language-modal-title">
          {translations['language.title'] || 'Choose the Language'}
        </div>
        <div className="language-modal-subtitle">
          {translations['language.subtitle'] || 'Please select your preferred language'}
        </div>
        <div className="language-options">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${currentLang === lang.code ? 'active' : ''}`}
              data-lang={lang.code}
              onClick={() => onSelect(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageModal;

