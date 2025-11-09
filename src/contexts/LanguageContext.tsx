import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: 'ur' | 'en';
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');

  useEffect(() => {
    const dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'ur' ? 'en' : 'ur';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL: language === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
