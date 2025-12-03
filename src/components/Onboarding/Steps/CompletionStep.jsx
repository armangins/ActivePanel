import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CompletionStep = ({ onFinish }) => {
    const { t } = useLanguage();

    return (
        <div className="text-center">
            <div className="mb-8">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('setupComplete') || 'ההגדרה הושלמה!'}
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                    {t('setupCompleteDesc') || 'החנות שלך מחוברת כעת ל-ActivePanel. אתה מוכן להתחיל לנהל את העסק שלך.'}
                </p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={onFinish}
                    className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                >
                    {t('goToDashboard') || 'עבור ללוח הבקרה'}
                </button>
            </div>
        </div>
    );
};

export default CompletionStep;
