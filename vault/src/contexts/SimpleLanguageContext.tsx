import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface SimpleLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SimpleLanguageContext = createContext<SimpleLanguageContextType | undefined>(undefined);

export const SimpleLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <SimpleLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </SimpleLanguageContext.Provider>
  );
};

export const useSimpleLanguage = () => {
  const context = useContext(SimpleLanguageContext);
  if (!context) {
    throw new Error('useSimpleLanguage must be used within SimpleLanguageProvider');
  }
  return context;
};

// Simple translations for navbar and key texts
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.vault': 'Vault',
    'nav.upload': 'Upload',
    'nav.voting': 'Voting',
    'nav.flagged': 'Flagged',
    'nav.checker': 'Page Checker',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.wallet': 'Wallet',
    'language.toggle': 'Language',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.vault': 'तिजोरी',
    'nav.upload': 'अपलोड',
    'nav.voting': 'मतदान',
    'nav.flagged': 'चिन्हित',
    'nav.checker': 'पेज जांच',
    'nav.analytics': 'विश्लेषण',
    'nav.settings': 'सेटिंग्स',
    'nav.wallet': 'वॉलेट',
    'language.toggle': 'भाषा',
  },
};

export const t = (key: string, lang: Language): string => {
  return translations[lang][key] || key;
};
