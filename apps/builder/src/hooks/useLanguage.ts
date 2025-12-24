import { useState, useEffect } from "react";
import { translations as embeddedTranslations } from "../utils/translations";

// Helper function to flatten nested object
function flattenObject(obj: Record<string, unknown>, prefix: string = ""): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key] as Record<string, unknown>, newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  return flattened;
}

export function useLanguage() {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem("wedding-lang") || "en";
  });
  const [translations, setTranslations] = useState<Record<string, Record<string, unknown>>>(() => {
    const flattened = {
      en: flattenObject(embeddedTranslations.en as Record<string, unknown>),
      hi: flattenObject(embeddedTranslations.hi as Record<string, unknown>),
      te: flattenObject(embeddedTranslations.te as Record<string, unknown>),
    };
    return flattened;
  });

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const updateLanguage = (lang: string): void => {
    setCurrentLang(lang);
    localStorage.setItem("wedding-lang", lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
  };

  const getTranslation = (key: string): string => {
    const langData = translations[currentLang] || {};
    return (langData[key] as string) || "";
  };

  return {
    currentLang,
    translations: translations[currentLang] || {},
    updateLanguage,
    getTranslation,
  };
}
