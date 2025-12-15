import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, Alert } from 'antd';
import {
    GlobalOutlined as Globe,
    KeyOutlined as Key,
    BarChartOutlined as BarChart3,
    ThunderboltOutlined as Sparkles,
    InboxOutlined as Package,
    DatabaseOutlined as Database,
    QuestionCircleOutlined as HelpCircle,
    SaveOutlined as Save,
    CheckCircleOutlined as CheckCircle,
    CloseCircleOutlined as XCircle
} from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { testConnection, productsAPI } from '../../services/woocommerce';
import { settingsAPI } from '../../services/api';
import { settingsSchema } from '../../schemas/settings';
import { LoadingState, Button } from '../ui';
import { secureLog } from '../../utils/logger';


// Lazy load tab components
const GA4Connection = lazy(() => import('./tabs/GA4Connection'));
const WooCommerceSettings = lazy(() => import('./tabs/WooCommerceSettings'));
const GeminiSettings = lazy(() => import('./tabs/GeminiSettings'));
const ProductSettings = lazy(() => import('./tabs/ProductSettings'));
const SystemSettings = lazy(() => import('./tabs/SystemSettings'));
const HelpSettings = lazy(() => import('./tabs/HelpSettings'));

const Settings = () => {
    const { t } = useLanguage();
    const { updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('woocommerce');
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // 'success', 'error', null
    const [message, setMessage] = useState(null);

    // Track which credentials are already configured (from backend)
    const [configuredCredentials, setConfiguredCredentials] = useState({
        hasConsumerKey: false,
        hasConsumerSecret: false,
        hasWordpressUsername: false,
        hasWordpressAppPassword: false,
    });

    const methods = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            woocommerceUrl: '',
            consumerKey: '',
            consumerSecret: '',
            wordpressUsername: '',
            wordpressAppPassword: '',
            ga4PropertyId: '',
            ga4MeasurementId: '',
            ga4ApiSecret: '',
            geminiApiKey: '',
            lowStockThreshold: 2,
        },
        mode: 'onChange',
        reValidateMode: 'onChange',
        shouldUnregister: false
    });

    const { handleSubmit, reset, getValues, formState: { isValid, isDirty } } = methods;

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const savedSettings = await settingsAPI.get();
                if (savedSettings) {
                    // Store which credentials are configured
                    setConfiguredCredentials({
                        hasConsumerKey: savedSettings.hasConsumerKey || false,
                        hasConsumerSecret: savedSettings.hasConsumerSecret || false,
                        hasWordpressUsername: savedSettings.hasWordpressUsername || false,
                        hasWordpressAppPassword: savedSettings.hasWordpressAppPassword || false,
                    });

                    // Update form with saved settings
                    // Only update known fields to avoid polluting form state
                    // Trim values to prevent whitespace validation issues
                    reset({
                        woocommerceUrl: (savedSettings.storeUrl || savedSettings.woocommerceUrl || '').trim(),
                        consumerKey: (savedSettings.consumerKey || '').trim(),
                        consumerSecret: (savedSettings.consumerSecret || '').trim(),
                        wordpressUsername: (savedSettings.wordpressUsername || '').trim(),
                        wordpressAppPassword: (savedSettings.wordpressAppPassword || '').trim(),
                        ga4PropertyId: (savedSettings.ga4PropertyId || '').trim(),
                        ga4MeasurementId: (savedSettings.ga4MeasurementId || '').trim(),
                        ga4ApiSecret: (savedSettings.ga4ApiSecret || '').trim(),
                        geminiApiKey: (savedSettings.geminiApiKey || '').trim(),
                        lowStockThreshold: savedSettings.lowStockThreshold || 2,
                    });
                }
            } catch (error) {
                secureLog.error('Failed to load settings:', error);
                setMessage({ type: 'error', text: 'Failed to load settings from server.' });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [reset]);

    const tabs = useMemo(() => [
        { id: 'woocommerce', label: t('woocommerceSettings') || 'WooCommerce API', icon: Globe },
        // { id: 'wordpress', label: t('wordpressIntegration') || 'WordPress', icon: Key }, // Merged into WooCommerce
        { id: 'ga4', label: t('ga4Settings') || 'Google Analytics', icon: BarChart3 },
        { id: 'ai', label: t('geminiSettings') || 'Gemini AI', icon: Sparkles },
        { id: 'products', label: t('productSettings') || 'מוצרים', icon: Package },
        { id: 'system', label: t('systemSettings') || 'מערכת', icon: Database },
        { id: 'help', label: t('helpAndDocumentation') || 'עזרה', icon: HelpCircle },
    ], [t]);

    const handleTestConnection = useCallback(async () => {
        const values = getValues();

        if (!values.woocommerceUrl || !values.consumerKey || !values.consumerSecret) {
            setMessage({ type: 'error', text: 'Please fill in all fields before testing the connection.' });
            return;
        }

        setTesting(true);
        setConnectionStatus(null);
        setMessage(null);

        try {
            // 1. Pass data to backend as requested
            await settingsAPI.update(values);

            // 2. Test the connection (via backend proxy)
            await testConnection();

            setConnectionStatus('success');
            setMessage({ type: 'success', text: t('connectionSuccessful') || 'החיבור הצליח! ההגדרות נשמרו ואומתו.' });

        } catch (error) {
            setConnectionStatus('error');
            setMessage({ type: 'error', text: error.message || 'Connection failed. Please check your credentials.' });
        } finally {
            setTesting(false);
        }
    }, [getValues, setMessage, setTesting, setConnectionStatus, t]);

    const handleClearCache = useCallback(() => {
        if (window.confirm(t('clearCacheConfirm') || 'Are you sure you want to clear all cached data? This will force the app to reload all data from the server.')) {
            window.location.reload();
            setMessage({ type: 'success', text: t('cacheCleared') || 'Cache cleared successfully. Data will be reloaded on next request.' });
        }
    }, [t, setMessage]);

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage(null);

        try {
            // Save settings to backend
            const updated = await settingsAPI.update(data);
            
            // Update settings in context to trigger re-renders
            if (updateSettings) {
                await updateSettings(updated || data);
            }

            setMessage({ type: 'success', text: t('settingsSaved') });

            // Notify other components (like ConnectionStatus) that settings were updated
            window.dispatchEvent(new Event('settingsUpdated'));

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage(null);
            }, 3000);

            // Re-fetch configuration status to update placeholders if keys were added
            if (data.consumerKey) setConfiguredCredentials(prev => ({ ...prev, hasConsumerKey: true }));
            if (data.consumerSecret) setConfiguredCredentials(prev => ({ ...prev, hasConsumerSecret: true }));

        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        return (
            <Suspense fallback={<LoadingState />}>
                {(() => {
                    switch (activeTab) {
                        case 'woocommerce':
                            return (
                                <WooCommerceSettings
                                    configuredCredentials={configuredCredentials}
                                    onTestConnection={handleTestConnection}
                                    testing={testing}
                                />
                            );

                        case 'ga4':
                            return (
                                <GA4Connection
                                    onTestConnection={handleTestConnection}
                                />
                            );

                        case 'ai':
                            return (
                                <GeminiSettings />
                            );

                        case 'products':
                            return (
                                <ProductSettings />
                            );

                        case 'system':
                            return (
                                <SystemSettings
                                    onClearCache={handleClearCache}
                                />
                            );

                        case 'help':
                            return <HelpSettings />;

                        default:
                            return null;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
                        <p className="text-gray-600 mt-1">{t('configureAPI')}</p>
                    </div>

                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading || !isValid}
                        variant="primary"
                        className={`flex items-center ${'flex-row-reverse space-x-reverse'}`}
                    >
                        <Save className="w-[18px] h-[18px]" />
                        <span>{loading ? t('saving') : t('saveSettings')}</span>
                    </Button>
                </div>

                {/* Global Message */}
                {message && (
                    <Alert
                        message={message.text}
                        type={message.type === 'success' ? 'success' : 'error'}
                        showIcon
                        closable
                        onClose={() => setMessage(null)}
                        style={{ marginBottom: 24 }}
                    />
                )}

                {/* Main Settings Container */}
                <div className="flex-1">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabs.map(tab => ({
                            key: tab.id,
                            label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {React.createElement(tab.icon, { style: { fontSize: 16 } })}
                                    {tab.label}
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '24px 0' }}>
                                    {renderTabContent()}
                                </div>
                            ),
                        }))}
                        direction="rtl"
                    />
                </div>
            </div>
        </FormProvider>
    );
};

export default Settings;
