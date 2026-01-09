import React from 'react';

export interface LanguageContextType {
    t: (key: string, params?: Record<string, any>) => string;
    language: string;
    setLanguage: (lang: string) => void;
    dir: 'ltr' | 'rtl';
    isRTL: boolean;
    formatCurrency: (amount: number | string) => string;
}

export const LanguageContext: React.Context<LanguageContextType>;
export const LanguageProvider: React.FC<{ children: React.ReactNode }>;
export const useLanguage: () => LanguageContextType;
