import React from 'react';
import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { Button } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const SKUField = ({ value, onChange, onGenerate, isGenerating }) => {
    const { t } = useLanguage();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('sku')}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t('enterSKU') || 'Enter SKU'}
                    className="input-field text-right w-full pr-10" // Added padding for button
                    dir="rtl"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className={`p-1.5 h-auto ${isGenerating
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                            }`}
                        title={t('createWithAI') || 'צור בעזרת AI'}
                    >
                        {isGenerating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SKUField;
