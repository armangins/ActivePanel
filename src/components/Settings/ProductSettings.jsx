import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/inputs';

const ProductSettings = ({ settings, onSettingsChange }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <Input
                    id="low-stock-threshold"
                    name="lowStockThreshold"
                    label={t('lowStockThreshold') || 'סף מלאי נמוך'}
                    type="number"
                    min="0"
                    step="1"
                    value={settings.lowStockThreshold.toString()}
                    onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 0) {
                            onSettingsChange({ ...settings, lowStockThreshold: value });
                        }
                    }}
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('lowStockThresholdDesc') || 'מוצרים עם מלאי שווה או נמוך מהערך הזה ייחשבו כמוצרים במלאי נמוך (כולל מוצרים אזלו מהמלאי)'}
                </p>
            </div>
        </div>
    );
};

export default ProductSettings;
