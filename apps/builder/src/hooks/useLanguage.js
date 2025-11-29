import { useState, useEffect } from 'react';
import { translations as embeddedTranslations } from '../utils/translations.js';

// Helper function to flatten nested object
function flattenObject(obj, prefix = '') {
  const flattened = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  return flattened;
}

export function useLanguage() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('wedding-lang') || 'en';
  });
  const [translations, setTranslations] = useState(() => {
    const flattened = {
      en: flattenObject(embeddedTranslations.en),
      hi: flattenObject(embeddedTranslations.hi),
      te: flattenObject(embeddedTranslations.te)
    };
    return flattened;
  });

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const updateLanguage = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('wedding-lang', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  };

  const getTranslation = (key) => {
    const langData = translations[currentLang] || {};
    return langData[key] || '';
  };

  return {
    currentLang,
    translations: translations[currentLang] || {},
    updateLanguage,
    getTranslation
  };
}

