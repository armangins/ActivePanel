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
  const t = useCallback((key, params) => {
    let text = heTranslations[key];
    if (!text) return key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), params[k]);
      });
    }
    return text;
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 'undefined') return '';
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
    }).format(num);
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


