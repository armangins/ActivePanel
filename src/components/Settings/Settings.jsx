import { useState } from 'react';
import { Save, Key, Globe, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';

const Settings = () => {
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = useState({
    woocommerceUrl: localStorage.getItem('woocommerce_url') || '',
    consumerKey: localStorage.getItem('consumer_key') || '',
    consumerSecret: localStorage.getItem('consumer_secret') || '',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [message, setMessage] = useState(null);

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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('woocommerce_url', settings.woocommerceUrl);
      localStorage.setItem('consumer_key', settings.consumerKey);
      localStorage.setItem('consumer_secret', settings.consumerSecret);

      // Also update environment variables (for development)
      // In production, these should be set as actual environment variables
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Reload page to apply new settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your WooCommerce API credentials</p>
      </div>

      <div className="card max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Globe size={16} className="mr-2" />
              WooCommerce Store URL
            </label>
            <input
              type="url"
              placeholder="https://your-store.com"
              value={settings.woocommerceUrl}
              onChange={(e) => setSettings({ ...settings, woocommerceUrl: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your WooCommerce store URL (without trailing slash)
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Key size={16} className="mr-2" />
              Consumer Key
            </label>
            <input
              type="text"
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.consumerKey}
              onChange={(e) => setSettings({ ...settings, consumerKey: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your WooCommerce API Consumer Key
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Key size={16} className="mr-2" />
              Consumer Secret
            </label>
            <input
              type="password"
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.consumerSecret}
              onChange={(e) => setSettings({ ...settings, consumerSecret: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your WooCommerce API Consumer Secret
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg flex items-start space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {connectionStatus === 'success' && <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />}
              {connectionStatus === 'error' && <XCircle size={20} className="flex-shrink-0 mt-0.5" />}
              <p>{message.text}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={testing || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Test Connection</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !settings.woocommerceUrl || !settings.consumerKey || !settings.consumerSecret}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card max-w-2xl bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Get API Credentials</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Log in to your WooCommerce store admin panel</li>
          <li>Navigate to WooCommerce → Settings → Advanced → REST API</li>
          <li>Click "Add Key" to create a new API key</li>
          <li>Set the description and user permissions (read/write)</li>
          <li>Copy the Consumer Key and Consumer Secret</li>
          <li>Paste them in the fields above and save</li>
        </ol>
      </div>

      <div className="card max-w-2xl bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Security Note</h3>
        <p className="text-sm text-yellow-800">
          For production use, store these credentials as environment variables instead of in localStorage. 
          Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file with:
        </p>
        <pre className="mt-2 p-3 bg-yellow-100 rounded text-xs overflow-x-auto">
{`VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx`}
        </pre>
      </div>
    </div>
  );
};

export default Settings;

