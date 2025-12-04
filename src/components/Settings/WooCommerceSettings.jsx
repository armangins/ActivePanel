import React from 'react';
import { GlobeAltIcon as Globe, KeyIcon as Key, ArrowPathIcon as Loader, CheckCircleIcon as CheckCircle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/inputs';
import { Button } from '../ui';

const WooCommerceSettings = ({ settings, onSettingsChange, onTestConnection, testing }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <Input
                    id="woocommerce-url"
                    name="woocommerceUrl"
                    label={t('storeURL')}
                    type="url"
                    placeholder={t('enterStoreURL') || 'https://your-store.com'}
                    value={settings.woocommerceUrl}
                    onChange={(e) => onSettingsChange({ ...settings, woocommerceUrl: e.target.value })}
                    leftIcon={Globe}
                    autoComplete="url"
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('enterStoreURL')}
                </p>
            </div>

            <div>
                <Input
                    id="consumer-key"
                    name="consumerKey"
                    label={t('consumerKey')}
                    type="text"
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.consumerKey}
                    onChange={(e) => onSettingsChange({ ...settings, consumerKey: e.target.value })}
                    leftIcon={Key}
                    autoComplete="username"
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('yourConsumerKey')}
                </p>
            </div>

            <div>
                <Input
                    id="consumer-secret"
                    name="consumerSecret"
                    label={t('consumerSecret')}
                    type="password"
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.consumerSecret}
                    onChange={(e) => onSettingsChange({ ...settings, consumerSecret: e.target.value })}
                    leftIcon={Key}
                    autoComplete="current-password"
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('yourConsumerSecret')}
                </p>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-3 flex-row-reverse">
                <Button
                    onClick={onTestConnection}
                    disabled={testing || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
                    variant="secondary"
                    className={`flex items-center ${'flex-row-reverse space-x-reverse'}`}
                >
                    {testing ? (
                        <>
                            <Loader className="w-[18px] h-[18px] animate-spin" />
                            <span>{t('testing')}</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-[18px] h-[18px]" />
                            <span>{t('checkAndSave') || 'Check and Save'}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default WooCommerceSettings;
