import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import heTranslations from '../translations/he';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const t = useCallback((key) => {
    return heTranslations[key];
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'he';
  }, []);

  const value = useMemo(() => ({
    t,
    formatCurrency,
    isRTL: true,
  }), [t, formatCurrency]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};


