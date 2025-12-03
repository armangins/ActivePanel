import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const WelcomeStep = ({ onNext }) => {
    const { t } = useLanguage();

    return (
        <div className="text-center">
            <div className="mb-8">
                <img src="/logo.svg" alt="ActivePanel" className="h-16 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('welcomeToActivePanel') || 'ברוכים הבאים ל-ActivePanel'}
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                    {t('onboardingWelcomeDesc') || 'בוא נגדיר את החנות שלך כדי שנוכל להתחיל לעבוד. זה ייקח רק כמה דקות.'}
                </p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={onNext}
                    className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                >
                    {t('getStarted') || 'בוא נתחיל'}
                </button>
            </div>
        </div>
    );
};

export default WelcomeStep;
