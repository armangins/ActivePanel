import { useState } from 'react';
import { Save, Key, Globe, CheckCircle, XCircle, Loader, Eye, EyeOff, BarChart3, Trash2, Package, Database, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';
import { testGA4Connection } from '../../services/ga4';
import { clearAllCache } from '../../services/cache';
import GA4Connection from './GA4Connection';

const Settings = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('woocommerce');
  const [settings, setSettings] = useState({
    woocommerceUrl: localStorage.getItem('woocommerce_url') || '',
    consumerKey: localStorage.getItem('consumer_key') || '',
    consumerSecret: localStorage.getItem('consumer_secret') || '',
    wordpressUsername: localStorage.getItem('wordpress_username') || '',
    wordpressAppPassword: localStorage.getItem('wordpress_app_password') || '',
    ga4PropertyId: localStorage.getItem('ga4_property_id') || '',
    ga4AccessToken: localStorage.getItem('ga4_access_token') || '',
    lowStockThreshold: parseInt(localStorage.getItem('low_stock_threshold') || '2', 10),
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);

  const tabs = [
    { id: 'woocommerce', label: t('woocommerceSettings') || 'WooCommerce API', icon: Globe },
    { id: 'wordpress', label: t('wordpressIntegration') || 'WordPress', icon: Key },
    { id: 'ga4', label: t('ga4Settings') || 'Google Analytics', icon: BarChart3 },
    { id: 'products', label: t('productSettings') || 'מוצרים', icon: Package },
    { id: 'system', label: t('systemSettings') || 'מערכת', icon: Database },
    { id: 'help', label: t('helpAndDocumentation') || 'עזרה', icon: HelpCircle },
  ];

  const handleTestConnection = async () => {
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
  };

  const handleClearCache = () => {
    if (window.confirm(t('clearCacheConfirm') || 'Are you sure you want to clear all cached data? This will force the app to reload all data from the server.')) {
      clearAllCache();
      setMessage({ type: 'success', text: t('cacheCleared') || 'Cache cleared successfully. Data will be reloaded on next request.' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('woocommerce_url', settings.woocommerceUrl);
      localStorage.setItem('consumer_key', settings.consumerKey);
      localStorage.setItem('consumer_secret', settings.consumerSecret);
      localStorage.setItem('wordpress_username', settings.wordpressUsername.trim());
      localStorage.setItem('wordpress_app_password', settings.wordpressAppPassword);
      localStorage.setItem('low_stock_threshold', settings.lowStockThreshold.toString());
      localStorage.setItem('ga4_property_id', settings.ga4PropertyId);
      localStorage.setItem('ga4_access_token', settings.ga4AccessToken);

      // Settings are saved - no need to reload, API will use new credentials on next call
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
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'woocommerce':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="woocommerce-url" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                <Globe size={16} className={'ml-2'} />
                {t('storeURL')}
              </label>
              <input
                id="woocommerce-url"
                name="woocommerceUrl"
                type="url"
                placeholder={t('enterStoreURL') || 'https://your-store.com'}
                value={settings.woocommerceUrl}
                onChange={(e) => setSettings({ ...settings, woocommerceUrl: e.target.value })}
                className="input-field text-right"
                dir="rtl"
                autoComplete="url"
              />
              <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                {t('enterStoreURL')}
              </p>
            </div>

            <div>
              <label htmlFor="consumer-key" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                <Key size={16} className={'ml-2'} />
                {t('consumerKey')}
              </label>
              <input
                id="consumer-key"
                name="consumerKey"
                type="text"
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.consumerKey}
                onChange={(e) => setSettings({ ...settings, consumerKey: e.target.value })}
                className="input-field text-right"
                dir="ltr"
                autoComplete="username"
              />
              <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                {t('yourConsumerKey')}
              </p>
            </div>

            <div>
              <label htmlFor="consumer-secret" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                <Key size={16} className={'ml-2'} />
                {t('consumerSecret')}
              </label>
              <div className="relative">
                <input
                  id="consumer-secret"
                  name="consumerSecret"
                  type={showConsumerSecret ? 'text' : 'password'}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={settings.consumerSecret}
                  onChange={(e) => setSettings({ ...settings, consumerSecret: e.target.value })}
                  className="input-field pr-10 text-right"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-consumer-secret"
                  aria-label={showConsumerSecret ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                  className={`absolute top-1/2 -translate-y-1/2 ${'left-3'} text-gray-500 hover:text-gray-700`}
                >
                  {showConsumerSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                {t('yourConsumerSecret')}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-3 flex-row-reverse">
              <button
                onClick={handleTestConnection}
                disabled={testing || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
                className={`btn-secondary flex items-center ${'flex-row-reverse space-x-reverse'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {testing ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>{t('testing')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>{t('testConnection')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'wordpress':
        return (
          <div className="space-y-6">
            <p className={`text-sm text-gray-600 ${'text-right'}`}>
              {t('wpAppPasswordDesc') || 'נדרש להעלאת תמונות. קבל אותו מ-WordPress: משתמשים → פרופיל → סיסמאות אפליקציה'}
            </p>
            
            <div>
              <label htmlFor="wordpress-username" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                <Key size={16} className={'ml-2'} />
                {t('wpUsername') || 'WordPress Username'}
              </label>
              <input
                id="wordpress-username"
                name="wordpressUsername"
                type="text"
                placeholder={t('wpUsernamePlaceholder') || 'your-wordpress-username'}
                value={settings.wordpressUsername}
                onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
                className="input-field text-right"
                dir="ltr"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="app-password" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                <Key size={16} className={'ml-2'} />
                {t('appPassword') || 'Application Password'}
              </label>
              <div className="relative">
                <input
                  id="app-password"
                  name="wordpressAppPassword"
                  type={showAppPassword ? 'text' : 'password'}
                  placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                  value={settings.wordpressAppPassword}
                  onChange={(e) => setSettings({ ...settings, wordpressAppPassword: e.target.value })}
                  className="input-field pr-10 text-right"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-app-password"
                  aria-label={showAppPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  onClick={() => setShowAppPassword(!showAppPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${'left-3'} text-gray-500 hover:text-gray-700`}
                >
                  {showAppPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                {t('appPasswordDesc') || 'Generated from WordPress → Users → Profile → Application Passwords'}
              </p>
            </div>
          </div>
        );

      case 'ga4':
        return (
          <GA4Connection
            settings={settings}
            onSettingsChange={setSettings}
            onTestConnection={handleTestConnection}
          />
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="low-stock-threshold" className={`flex items-center text-sm font-medium text-gray-700 mb-2 ${'flex-row-reverse'}`}>
                {t('lowStockThreshold') || 'סף מלאי נמוך'}
              </label>
              <input
                id="low-stock-threshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                value={settings.lowStockThreshold}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0) {
                    setSettings({ ...settings, lowStockThreshold: value });
                  }
                }}
                className="input-field text-right"
                dir="ltr"
              />
              <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                {t('lowStockThresholdDesc') || 'מוצרים עם מלאי שווה או נמוך מהערך הזה ייחשבו כמוצרים במלאי נמוך (כולל מוצרים אזלו מהמלאי)'}
              </p>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <p className={`text-sm text-gray-600 mb-4 ${'text-right'}`}>
                {t('cacheManagementDesc') || 'נקה נתונים שמורים ב-Cache כדי לטעון מחדש מהשרת. זה יכול לעזור אם הנתונים נראים לא מעודכנים.'}
              </p>
              <button
                onClick={handleClearCache}
                className="btn-secondary flex items-center flex-row-reverse space-x-reverse"
              >
                <Trash2 size={18} />
                <span>{t('clearCache') || 'נקה Cache'}</span>
              </button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4 text-right">
                {t('howToGetAPICredentials') || 'איך לקבל פרטי API'}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-primary-800 text-right">
                <li>{t('apiStep1') || 'התחבר לפאנל הניהול של WooCommerce'}</li>
                <li>{t('apiStep2') || 'נווט אל WooCommerce → הגדרות → מתקדם → REST API'}</li>
                <li>{t('apiStep3') || 'לחץ על "הוסף מפתח" כדי ליצור מפתח API חדש'}</li>
                <li>{t('apiStep4') || 'הגדר את התיאור והרשאות המשתמש (קריאה/כתיבה)'}</li>
                <li>{t('apiStep5') || 'העתק את מפתח הצרכן וסוד הצרכן'}</li>
                <li>{t('apiStep6') || 'הדבק אותם בשדות למעלה ושמור'}</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2 text-right">
                {t('securityNote') || 'הערת אבטחה'}
              </h3>
              <p className="text-sm text-yellow-800 text-right mb-3">
                {t('securityText') || 'לשימוש בפרודקשן, שמור את הפרטים האלה כמשתני סביבה במקום localStorage. צור קובץ .env עם:'}
              </p>
              <pre className="mt-2 p-3 bg-yellow-100 rounded text-xs overflow-x-auto text-right">
{`VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx`}
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className={'text-right'}>
        <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="text-gray-600 mt-1">{t('configureAPI')}</p>
      </div>

      {/* Global Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start flex-row-reverse space-x-reverse space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {connectionStatus === 'success' && <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />}
          {connectionStatus === 'error' && <XCircle size={20} className="flex-shrink-0 mt-0.5" />}
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
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
                return <Icon className="text-primary-500" size={20} />;
              })()}
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label || 'הגדרות'}
              </h2>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 shadow-lg">
        <div className="max-w-full flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
            className={`btn-primary flex items-center ${'flex-row-reverse space-x-reverse'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save size={18} />
            <span>{saving ? t('saving') : t('saveSettings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
