import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';
import { BuildingStorefrontIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const StoreDetailsStep = ({ onNext, onSkip, initialData }) => {
    const { t } = useLanguage();
    const [storeName, setStoreName] = useState(initialData.storeName || '');
    const [woocommerceUrl, setWoocommerceUrl] = useState(initialData.woocommerceUrl || '');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Optional URL validation
        if (woocommerceUrl.trim()) {
            try {
                new URL(woocommerceUrl);
            } catch (e) {
                setError(t('invalidUrl') || 'כתובת אתר לא תקינה (חייבת לכלול http:// או https://)');
                return;
            }
        }

        onNext({ storeName, woocommerceUrl });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t('storeDetails') || 'פרטי החנות'}
            </h2>
            <p className="text-gray-600 mb-8 text-center">
                {t('enterStoreDetails') || 'הכנס את פרטי חנות הווקומרס שלך'}
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm text-right">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label={t('storeName') || 'שם החנות'}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={t('myAwesomeStore') || 'החנות שלי'}
                    leftIcon={BuildingStorefrontIcon}
                    dir="rtl"
                />

                <Input
                    label={t('storeUrl') || 'כתובת האתר'}
                    value={woocommerceUrl}
                    onChange={(e) => setWoocommerceUrl(e.target.value)}
                    placeholder="https://example.com"
                    leftIcon={GlobeAltIcon}
                    dir="ltr"
                    type="url"
                />

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 shadow-lg shadow-primary-500/30"
                >
                    {t('next') || 'המשך'}
                </Button>

                <Button
                    type="button"
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full py-3 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                >
                    {t('setupLater') || 'הגדר מאוחר יותר'}
                </Button>
            </form>
        </div>
    );
};

export default StoreDetailsStep;
