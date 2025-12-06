import React, { useState } from 'react';
import { SparklesIcon as Sparkles, ArrowPathIcon as Loader, CheckCircleIcon as CheckCircle, XCircleIcon as XCircle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';
import { testGeminiConnection, setGeminiApiKey } from '../../../services/gemini';

const GeminiSettings = ({ settings, onSettingsChange }) => {
    const { t } = useLanguage();
    const [testingGemini, setTestingGemini] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [message, setMessage] = useState(null);

    const handleTestConnection = async () => {
        if (!settings.geminiApiKey) {
            setMessage({ type: 'error', text: t('fillGeminiApiKey') || 'אנא הזן מפתח API לפני בדיקת החיבור.' });
            return;
        }

        setTestingGemini(true);
        setMessage(null);
        setConnectionStatus(null);

        try {
            // Set API key in memory for testing
            setGeminiApiKey(settings.geminiApiKey);

            try {
                const isConnected = await testGeminiConnection();
                if (isConnected) {
                    setConnectionStatus('success');
                    setMessage({ type: 'success', text: t('geminiConnectionSuccess') || 'חיבור ל-Gemini הצליח! מפתח ה-API תקין.' });
                } else {
                    setConnectionStatus('error');
                    setMessage({ type: 'error', text: t('geminiConnectionError') || 'שגיאה בחיבור ל-Gemini. אנא בדוק את מפתח ה-API.' });
                }
            } catch (error) {
                setConnectionStatus('error');
                const errorMessage = error.message || t('geminiConnectionError') || 'שגיאה בחיבור ל-Gemini.';
                setMessage({ type: 'error', text: errorMessage });
            }
        } catch (error) {
            setConnectionStatus('error');
            setMessage({ type: 'error', text: error.message || t('geminiConnectionError') || 'שגיאה בבדיקת החיבור.' });
        } finally {
            setTestingGemini(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className={`text-sm text-gray-600 mb-4 ${'text-right'}`}>
                    {t('geminiSettingsDesc') || 'הגדר את מפתח ה-API של Gemini AI לשימוש בעוזר AI ויצירת SKU אוטומטית.'}
                </p>
            </div>

            <div>
                <Input
                    id="gemini-api-key"
                    name="geminiApiKey"
                    label={t('geminiApiKey') || 'מפתח API של Gemini'}
                    type="password"
                    placeholder={t('geminiApiKeyPlaceholder') || 'הכנס מפתח API של Gemini'}
                    value={settings.geminiApiKey}
                    onChange={(e) => onSettingsChange({ ...settings, geminiApiKey: e.target.value })}
                    leftIcon={Sparkles}
                    autoComplete="off"
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('geminiApiKeyDesc') || 'קבל מפתח מ-Google AI Studio: https://makersuite.google.com/app/apikey'}
                </p>
            </div>

            {/* Local Message for Gemini Test */}
            {message && (
                <div className={`p-3 rounded-lg flex items-start flex-row-reverse space-x-reverse space-x-2 ${message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}>
                    {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {connectionStatus === 'error' && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <p className="text-sm text-right">{message.text}</p>
                </div>
            )}

            <div className="pt-4 border-t border-gray-200 flex gap-3 flex-row-reverse">
                <Button
                    onClick={handleTestConnection}
                    disabled={testingGemini || !settings.geminiApiKey}
                    variant="secondary"
                    className={`flex items-center ${'flex-row-reverse space-x-reverse'}`}
                >
                    {testingGemini ? (
                        <>
                            <Loader className="w-[18px] h-[18px] animate-spin" />
                            <span>{t('testing')}</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-[18px] h-[18px]" />
                            <span>{t('testGeminiConnection') || 'בדוק חיבור Gemini'}</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default GeminiSettings;
