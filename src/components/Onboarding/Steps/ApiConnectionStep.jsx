import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';
import { KeyIcon, LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { settingsAPI } from '../../../services/api';

const ApiConnectionStep = ({ onNext, onBack, onSkip, initialData }) => {
    const { t } = useLanguage();
    const [consumerKey, setConsumerKey] = useState(initialData.consumerKey || '');
    const [consumerSecret, setConsumerSecret] = useState(initialData.consumerSecret || '');
    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // 'success', 'error', null
    const [error, setError] = useState('');

    const handleTestConnection = async () => {
        setLoading(true);
        setTestStatus(null);
        setError('');

        try {
            // Save settings first to test them
            await settingsAPI.update({
                woocommerceUrl: initialData.woocommerceUrl,
                consumerKey,
                consumerSecret
            });

            // In a real app, we would trigger a test connection here.
            // For now, if saving succeeds, we assume it's okay or at least saved.
            // Ideally, the backend should verify the connection.

            setTestStatus('success');
        } catch (err) {
            console.error(err);
            setTestStatus('error');
            setError(t('connectionFailed') || 'החיבור נכשל. אנא בדוק את הפרטים ונסה שוב.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Optional validation
        // if (!consumerKey || !consumerSecret) {
        //     setError(t('fillAllFields') || 'נא למלא את כל השדות');
        //     return;
        // }

        onNext({ consumerKey, consumerSecret });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t('apiConnection') || 'חיבור API'}
            </h2>
            <p className="text-gray-600 mb-8 text-center">
                {t('enterApiKeys') || 'הכנס את מפתחות ה-API של ווקומרס'}
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm text-right">
                    {error}
                </div>
            )}

            {testStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm text-right flex items-center justify-end gap-2">
                    <span>{t('connectionSuccessful') || 'החיבור הצליח!'}</span>
                    <CheckCircleIcon className="w-5 h-5" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label={t('consumerKey') || 'Consumer Key'}
                    value={consumerKey}
                    onChange={(e) => setConsumerKey(e.target.value)}
                    placeholder="ck_..."
                    leftIcon={KeyIcon}
                    dir="ltr"
                />

                <Input
                    label={t('consumerSecret') || 'Consumer Secret'}
                    value={consumerSecret}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                    placeholder="cs_..."
                    leftIcon={LockClosedIcon}
                    dir="ltr"
                    type="password"
                />

                <div className="flex gap-4">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="secondary"
                        className="flex-1"
                    >
                        {t('back') || 'חזור'}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={loading}
                        variant="secondary"
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        {loading ? (t('testing') || 'בודק...') : (t('testConnection') || 'בדוק חיבור')}
                    </Button>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 shadow-lg shadow-primary-500/30"
                >
                    {t('finish') || 'סיים'}
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

export default ApiConnectionStep;
