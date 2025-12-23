import { describe, it, expect } from 'vitest';
import { translations } from './translations';

describe('translations', () => {
  it('should have translations for all supported languages', () => {
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('hi');
    expect(translations).toHaveProperty('te');
  });

  it('should have consistent structure across all languages', () => {
    const languages = Object.keys(translations);
    const englishKeys = Object.keys(translations.en);

    languages.forEach(lang => {
      const langKeys = Object.keys(translations[lang]);
      // Each language should have the same top-level keys
      expect(langKeys.sort()).toEqual(englishKeys.sort());
    });
  });

  it('should have required translation keys in English', () => {
    const en = translations.en;
    
    expect(en).toHaveProperty('language');
    expect(en).toHaveProperty('nav');
    expect(en).toHaveProperty('hero');
    expect(en).toHaveProperty('couple');
    expect(en).toHaveProperty('events');
    expect(en).toHaveProperty('venue');
    expect(en).toHaveProperty('rsvp');
    expect(en).toHaveProperty('footer');
  });

  it('should have nav translations', () => {
    const en = translations.en;
    
    expect(en.nav).toHaveProperty('home');
    expect(en.nav).toHaveProperty('couple');
    expect(en.nav).toHaveProperty('photos');
    expect(en.nav).toHaveProperty('program');
    expect(en.nav).toHaveProperty('venue');
    expect(en.nav).toHaveProperty('rsvp');
  });

  it('should have hero section translations', () => {
    const en = translations.en;
    
    expect(en.hero).toHaveProperty('eyebrow');
    expect(en.hero).toHaveProperty('names');
    expect(en.hero).toHaveProperty('date');
    expect(en.hero).toHaveProperty('location');
  });
});

