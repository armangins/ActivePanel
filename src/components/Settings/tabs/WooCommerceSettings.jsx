import React, { useState } from 'react';
import { GlobeAltIcon as Globe, KeyIcon as Key, ArrowPathIcon as Loader, CheckCircleIcon as CheckCircle, PencilIcon as Pencil } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';

const WooCommerceSettings = ({ settings, configuredCredentials = {}, onSettingsChange, onTestConnection, testing }) => {
    const { t } = useLanguage();
    const [showFields, setShowFields] = useState(false);

    // Check if all credentials are configured
    const allConfigured = configuredCredentials.hasConsumerKey &&
        configuredCredentials.hasConsumerSecret &&
        configuredCredentials.hasWordpressUsername &&
        configuredCredentials.hasWordpressAppPassword;

    // If all configured and user hasn't clicked "edit", show success state
    if (allConfigured && !showFields) {
        return (
            <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2 text-center">
                        {t('credentialsConfigured') || 'איזה כיף! ההגדרות שלך תקינות אפשר להתחיל לעבוד!'}
                    </h3>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={() => setShowFields(true)}
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <Pencil className="w-[18px] h-[18px]" />
                            <span>{t('editSettings') || 'ערוך הגדרות'}</span>
                        </Button>
                    </div>
                </div>

                {/* Store URL Display (always visible) */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-right flex-1">
                            <p className="text-sm text-gray-600 mb-1">{t('storeURL')}</p>
                            <p className="font-medium text-gray-900">{settings.woocommerceUrl}</p>
                        </div>
                        <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    </div>
                </div>
            </div>
        );
    }

    // Show full form (either not configured or user clicked "edit")
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
                <p className={`text - xs text - gray - 500 mt - 1 ${'text-right'} `}>
                    {t('enterStoreURL')}
                </p>
            </div>

            <div>
                <Input
                    id="consumer-key"
                    name="consumerKey"
                    label={t('consumerKey')}
                    type="password"
                    placeholder={configuredCredentials.hasConsumerKey ? t('credentialConfigured') : "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                    value={settings.consumerKey}
                    onChange={(e) => onSettingsChange({ ...settings, consumerKey: e.target.value })}
                    leftIcon={Key}
                    autoComplete="username"
                />
                <p className={`text - xs text - gray - 500 mt - 1 ${'text-right'} `}>
                    {t('yourConsumerKey')}
                </p>
            </div>

            <div>
                <Input
                    id="consumer-secret"
                    name="consumerSecret"
                    label={t('consumerSecret')}
                    type="password"
                    placeholder={configuredCredentials.hasConsumerSecret ? t('credentialConfigured') : "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                    value={settings.consumerSecret}
                    onChange={(e) => onSettingsChange({ ...settings, consumerSecret: e.target.value })}
                    leftIcon={Key}
                    autoComplete="current-password"
                />
                <p className={`text - xs text - gray - 500 mt - 1 ${'text-right'} `}>
                    {t('yourConsumerSecret')}
                </p>
            </div>

            {/* WordPress Integration Section */}
            <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">
                    {t('wordpressIntegration') || 'WordPress Integration'}
                </h3>
                <p className="text-sm text-gray-600 text-right mb-4">
                    {t('wpAppPasswordDesc') || 'נדרש להעלאת תמונות. קבל אותו מ-WordPress: משתמשים → פרופיל → סיסמאות אפליקציה'}
                </p>

                <div className="space-y-6">
                    <div>
                        <Input
                            id="wordpress-username"
                            name="wordpressUsername"
                            label={t('wpUsername') || 'WordPress Username'}
                            type="text"
                            placeholder={configuredCredentials.hasWordpressUsername ? t('credentialConfigured') : (t('wpUsernamePlaceholder') || 'your-wordpress-username')}
                            value={settings.wordpressUsername}
                            onChange={(e) => onSettingsChange({ ...settings, wordpressUsername: e.target.value })}
                            leftIcon={Key}
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <Input
                            id="app-password"
                            name="wordpressAppPassword"
                            label={t('appPassword') || 'Application Password'}
                            type="password"
                            placeholder={configuredCredentials.hasWordpressAppPassword ? t('credentialConfigured') : "xxxx xxxx xxxx xxxx xxxx xxxx"}
                            value={settings.wordpressAppPassword}
                            onChange={(e) => onSettingsChange({ ...settings, wordpressAppPassword: e.target.value })}
                            leftIcon={Key}
                            autoComplete="current-password"
                        />
                        <p className={`text - xs text - gray - 500 mt - 1 ${'text-right'} `}>
                            {t('appPasswordDesc') || 'Generated from WordPress → Users → Profile → Application Passwords'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-3 justify-end">
                <Button
                    onClick={onTestConnection}
                    disabled={testing || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
                    variant="secondary"
                    className="flex items-center gap-2"
                >
                    {testing ? (
                        <>
                            <Loader className="w-[18px] h-[18px] animate-spin" />
                            <span>{t('testing')}</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-[18px] h-[18px]" />
                            <span>{t('checkAndSave') || 'בדוק חיבור ושמור'}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default WooCommerceSettings;
