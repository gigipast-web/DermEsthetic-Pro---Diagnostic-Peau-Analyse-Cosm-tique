import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LanguageInfo, SUPPORTED_LANGUAGES } from '../types/i18n';
import { translations, TranslationDictionary } from '../i18n/translations';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageInfo: LanguageInfo;
  languages: LanguageInfo[];
  t: TranslationDictionary;
}

const STORAGE_LANG_KEY = 'dermesthetic_language_v1';

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved && (saved === 'fr' || saved === 'en' || saved === 'es' || saved === 'it' || saved === 'de' || saved === 'pt')) {
      return saved as SupportedLanguage;
    }

    // Try browser language detection
    const browserLang = navigator.language?.toLowerCase() || 'fr';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('pt')) return 'pt';
    return 'fr';
  } catch {
    return 'fr';
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Could not persist language to storage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const t = translations[currentLanguage] || translations.fr;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        currentLanguageInfo,
        languages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
