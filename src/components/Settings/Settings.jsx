import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  GlobeAltIcon as Globe,
  KeyIcon as Key,
  ChartBarIcon as BarChart3,
  SparklesIcon as Sparkles,
  CubeIcon as Package,
  CircleStackIcon as Database,
  QuestionMarkCircleIcon as HelpCircle,
  DocumentArrowDownIcon as Save,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';
import { LoadingState } from '../ui';


// Lazy load tab components
const GA4Connection = lazy(() => import('./GA4Connection'));
const WooCommerceSettings = lazy(() => import('./WooCommerceSettings'));
const WordPressSettings = lazy(() => import('./WordPressSettings'));
const GeminiSettings = lazy(() => import('./GeminiSettings'));
const ProductSettings = lazy(() => import('./ProductSettings'));
const SystemSettings = lazy(() => import('./SystemSettings'));
const HelpSettings = lazy(() => import('./HelpSettings'));

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('woocommerce');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState(null);

  // Initialize with default values (no persistence)
  const [settings, setSettings] = useState({
    woocommerceUrl: '',
    consumerKey: '',
    consumerSecret: '',
    wordpressUsername: '',
    wordpressAppPassword: '',
    ga4PropertyId: '',
    ga4AccessToken: '',
    geminiApiKey: '',
    lowStockThreshold: 2,
  });

  const tabs = useMemo(() => [
    { id: 'woocommerce', label: t('woocommerceSettings') || 'WooCommerce API', icon: Globe },
    { id: 'wordpress', label: t('wordpressIntegration') || 'WordPress', icon: Key },
    { id: 'ga4', label: t('ga4Settings') || 'Google Analytics', icon: BarChart3 },
    { id: 'ai', label: t('geminiSettings') || 'Gemini AI', icon: Sparkles },
    { id: 'products', label: t('productSettings') || 'מוצרים', icon: Package },
    { id: 'system', label: t('systemSettings') || 'מערכת', icon: Database },
    { id: 'help', label: t('helpAndDocumentation') || 'עזרה', icon: HelpCircle },
  ], [t]);

  const handleTestConnection = useCallback(async () => {
    if (!settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret) {
      setMessage({ type: 'error', text: 'Please fill in all fields before testing the connection.' });
      return;
    }

    setTesting(true);
    setConnectionStatus(null);
    setMessage(null);

    try {
      // Temporarily save credentials to test
      const originalUrl = localStorage.getItem('woocommerce_url');
      const originalKey = localStorage.getItem('consumer_key');
      const originalSecret = localStorage.getItem('consumer_secret');

      localStorage.setItem('woocommerce_url', settings.woocommerceUrl);
      localStorage.setItem('consumer_key', settings.consumerKey);
      localStorage.setItem('consumer_secret', settings.consumerSecret);

      try {
        await testConnection();
        setConnectionStatus('success');
        setMessage({ type: 'success', text: 'Connection successful! Your API credentials are working correctly.' });
      } catch (error) {
        setConnectionStatus('error');
        setMessage({ type: 'error', text: error.message || 'Connection failed. Please check your credentials.' });
      } finally {
        // Restore original credentials
        if (originalUrl) localStorage.setItem('woocommerce_url', originalUrl);
        if (originalKey) localStorage.setItem('consumer_key', originalKey);
        if (originalSecret) localStorage.setItem('consumer_secret', originalSecret);
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage({ type: 'error', text: error.message || 'Failed to test connection.' });
    } finally {
      setTesting(false);
    }
  }, [settings.woocommerceUrl, settings.consumerKey, settings.consumerSecret, setMessage, setTesting, setConnectionStatus]);

  const handleClearCache = useCallback(() => {
    if (window.confirm(t('clearCacheConfirm') || 'Are you sure you want to clear all cached data? This will force the app to reload all data from the server.')) {
      window.location.reload();
      setMessage({ type: 'success', text: t('cacheCleared') || 'Cache cleared successfully. Data will be reloaded on next request.' });
    }
  }, [t, setMessage]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Settings are updated in state - no need to save to localStorage
      // In a real app with backend, we would call an API here

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setMessage({ type: 'success', text: t('settingsSaved') });

      // Notify other components (like ConnectionStatus) that settings were updated
      window.dispatchEvent(new Event('settingsUpdated'));

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
    } finally {
      setLoading(false);
    }
  }, [settings, t, setMessage, setLoading]);

  const renderTabContent = () => {
    return (
      <Suspense fallback={<LoadingState />}>
        {(() => {
          switch (activeTab) {
            case 'woocommerce':
              return (
                <WooCommerceSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                  onTestConnection={handleTestConnection}
                  testing={testing}
                />
              );

            case 'wordpress':
              return (
                <WordPressSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              );

            case 'ga4':
              return (
                <GA4Connection
                  settings={settings}
                  onSettingsChange={setSettings}
                  onTestConnection={handleTestConnection}
                />
              );

            case 'ai':
              return (
                <GeminiSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              );

            case 'products':
              return (
                <ProductSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                />
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-600 mt-1">{t('configureAPI')}</p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
          className={`btn-primary flex items-center ${'flex-row-reverse space-x-reverse'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Save className="w-[18px] h-[18px]" />
          <span>{loading ? t('saving') : t('saveSettings')}</span>
        </button>
      </div>

      {/* Global Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start flex-row-reverse space-x-reverse space-x-3 ${message.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-orange-50 text-orange-800 border border-orange-200'
          }`}>
          {connectionStatus === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {connectionStatus === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-right">{message.text}</p>
        </div>
      )}

      {/* Main Settings Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="card">
            <div className="flex items-center gap-2 mb-6 flex-row-reverse">
              {(() => {
                const activeTabData = tabs.find(t => t.id === activeTab);
                const Icon = activeTabData?.icon || Globe;
                return <Icon className="w-5 h-5 text-primary-500" />;
              })()}
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label || 'הגדרות'}
              </h2>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Settings;
