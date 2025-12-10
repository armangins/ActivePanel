import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';

const ProductSettings = () => {
    const { t } = useLanguage();
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-6">
            <div>
                <Input
                    {...register('lowStockThreshold', { valueAsNumber: true })}
                    id="low-stock-threshold"
                    label={t('lowStockThreshold') || 'סף מלאי נמוך'}
                    type="number"
                    min="0"
                    step="1"
                    error={errors.lowStockThreshold?.message}
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('lowStockThresholdDesc') || 'מוצרים עם מלאי שווה או נמוך מהערך הזה ייחשבו כמוצרים במלאי נמוך (כולל מוצרים אזלו מהמלאי)'}
                </p>
            </div>
        </div>
    );
};

export default ProductSettings;
