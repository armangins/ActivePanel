import { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, XCircle, Loader, ExternalLink, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { testGA4Connection } from '../../services/ga4';

/**
 * GA4Connection Component
 * 
 * Provides an easy way to connect to Google Analytics 4
 * Uses Google OAuth 2.0 flow for authentication
 */
const GA4Connection = ({ settings, onSettingsChange, onTestConnection }) => {
  const { t } = useLanguage();
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Check if Google OAuth is available
  const isGoogleOAuthAvailable = () => {
    return typeof window !== 'undefined' && window.google && window.google.accounts;
  };

  // Initialize Google OAuth for GA4
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      return;
    }

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.accounts) {
          window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            callback: (response) => {
              if (response.access_token) {
                handleOAuthSuccess(response.access_token);
              } else {
                handleOAuthError('Failed to get access token');
              }
            },
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleOAuthSuccess = async (accessToken) => {
    try {
      // Save access token
      localStorage.setItem('ga4_access_token', accessToken);
      onSettingsChange({ ...settings, ga4AccessToken: accessToken });
      
      setConnecting(false);
      setMessage({ type: 'success', text: t('ga4TokenReceived') || 'Access token received successfully!' });
      
      // Auto-test connection if Property ID is set
      if (settings.ga4PropertyId) {
        setTimeout(() => {
          handleTestConnection();
        }, 500);
      }
    } catch (error) {
      handleOAuthError(error.message);
    }
  };

  const handleOAuthError = (errorMessage) => {
    setConnecting(false);
    setConnectionStatus('error');
    setMessage({ 
      type: 'error', 
      text: errorMessage || t('ga4OAuthError') || 'Failed to authenticate with Google. Please try again.' 
    });
  };

  const handleConnectWithGoogle = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      setMessage({ 
        type: 'error', 
        text: t('googleClientIdMissing') || 'Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file.' 
      });
      return;
    }

    setConnecting(true);
    setMessage(null);
    setConnectionStatus(null);

    try {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/analytics.readonly',
          callback: (response) => {
            if (response.access_token) {
              handleOAuthSuccess(response.access_token);
            } else {
              handleOAuthError('Failed to get access token');
            }
          },
        });
        
        // Request access token
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Fallback: redirect to manual token entry
        setShowInstructions(true);
        setConnecting(false);
      }
    } catch (error) {
      handleOAuthError(error.message);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.ga4PropertyId || !settings.ga4AccessToken) {
      setMessage({ 
        type: 'error', 
        text: t('fillGA4Fields') || 'Please fill in GA4 Property ID and Access Token' 
      });
      return;
    }

    setTesting(true);
    setMessage(null);
    setConnectionStatus(null);

    try {
      // Temporarily save to test
      const originalPropertyId = localStorage.getItem('ga4_property_id');
      const originalAccessToken = localStorage.getItem('ga4_access_token');

      localStorage.setItem('ga4_property_id', settings.ga4PropertyId);
      localStorage.setItem('ga4_access_token', settings.ga4AccessToken);

      try {
        await testGA4Connection();
        setConnectionStatus('success');
        setMessage({ 
          type: 'success', 
          text: t('ga4ConnectionSuccess') || 'GA4 connection successful!' 
        });
      } catch (error) {
        setConnectionStatus('error');
        setMessage({ 
          type: 'error', 
          text: error.message || t('ga4ConnectionFailed') || 'GA4 connection failed. Please check your credentials.' 
        });
      } finally {
        // Restore original values
        if (originalPropertyId) localStorage.setItem('ga4_property_id', originalPropertyId);
        if (originalAccessToken) localStorage.setItem('ga4_access_token', originalAccessToken);
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage({ 
        type: 'error', 
        text: error.message || t('ga4ConnectionFailed') || 'Failed to test GA4 connection.' 
      });
    } finally {
      setTesting(false);
    }
  };

  const isConnected = settings.ga4PropertyId && settings.ga4AccessToken && connectionStatus === 'success';

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {isConnected && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3 flex-row-reverse">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 text-right">
                {t('ga4Connected') || 'Connected to Google Analytics 4'}
              </p>
              <p className="text-xs text-green-700 text-right mt-1">
                {t('ga4ConnectedDesc') || 'Your GA4 data will appear on the dashboard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Property ID Input */}
      <div>
        <label htmlFor="ga4-property-id" className="flex items-center text-sm font-medium text-gray-700 mb-2 flex-row-reverse">
          <BarChart3 size={16} className="ml-2" />
          {t('ga4PropertyId') || 'GA4 Property ID'}
        </label>
        <input
          id="ga4-property-id"
          name="ga4PropertyId"
          type="text"
          dir="ltr"
          className="input-field w-full"
          placeholder="G-XXXXXXXXXX"
          value={settings.ga4PropertyId}
          onChange={(e) => onSettingsChange({ ...settings, ga4PropertyId: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {t('ga4PropertyIdDesc') || 'מצא אותו ב-GA4: Admin → Property Settings → Property ID'}
        </p>
        <a
                href="https://support.google.com/analytics/answer/9304153"
                target="_blank"
                rel="noopener noreferrer nofollow"
          className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-flex items-center gap-1 flex-row-reverse"
        >
          <ExternalLink size={12} />
          {t('howToFindPropertyId') || 'איך למצוא את ה-Property ID?'}
        </a>
      </div>

      {/* OAuth Connection Button */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 flex-row-reverse">
          <Key size={16} className="ml-2" />
          {t('ga4AccessToken') || 'Access Token'}
        </label>
        
        {settings.ga4AccessToken ? (
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="flex-1">
                <p className="text-xs text-gray-600 text-right">
                  {t('tokenSaved') || 'Token saved'} • {settings.ga4AccessToken.substring(0, 20)}...
                </p>
              </div>
              <button
                onClick={handleConnectWithGoogle}
                disabled={connecting}
                className="btn-secondary text-sm"
              >
                {connecting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>{t('connecting') || 'מתחבר...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>{t('refreshToken') || 'רענן Token'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectWithGoogle}
            disabled={connecting}
            className="btn-primary w-full flex items-center justify-center gap-2 flex-row-reverse"
          >
            {connecting ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>{t('connecting') || 'מתחבר...'}</span>
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                <span>{t('connectWithGoogle') || 'התחבר עם Google'}</span>
              </>
            )}
          </button>
        )}

        <p className="text-xs text-gray-500 mt-2 text-right">
          {t('ga4OAuthDesc') || 'לחץ על הכפתור כדי להתחבר עם Google ולקבל Access Token אוטומטית'}
        </p>
      </div>

      {/* Manual Token Entry (Fallback) */}
      {showInstructions && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3 flex-row-reverse">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 text-right mb-2">
                {t('manualTokenEntry') || 'הזנת Token ידנית'}
              </p>
              <p className="text-xs text-yellow-700 text-right mb-3">
                {t('manualTokenDesc') || 'אם החיבור האוטומטי לא עובד, תוכל להזין את ה-Access Token ידנית:'}
              </p>
              <ol className="text-xs text-yellow-800 text-right space-y-2 list-decimal list-inside">
                <li>{t('manualTokenStep1') || 'לך ל-Google Cloud Console'}</li>
                <li>{t('manualTokenStep2') || 'בחר את הפרויקט שלך'}</li>
                <li>{t('manualTokenStep3') || 'לך ל-APIs & Services → Credentials'}</li>
                <li>{t('manualTokenStep4') || 'צור OAuth 2.0 Client ID'}</li>
                <li>{t('manualTokenStep5') || 'השתמש ב-OAuth Playground לקבלת Token'}</li>
              </ol>
              <a
                href="https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-xs text-yellow-700 hover:text-yellow-900 mt-2 inline-flex items-center gap-1 flex-row-reverse"
              >
                <ExternalLink size={12} />
                {t('learnMoreGA4') || 'למד עוד על אימות GA4 API'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Test Connection Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleTestConnection}
          disabled={testing || !settings.ga4PropertyId || !settings.ga4AccessToken}
          className="btn-secondary w-full flex items-center justify-center gap-2 flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>{t('testing') || 'בודק...'}</span>
            </>
          ) : connectionStatus === 'success' ? (
            <>
              <CheckCircle size={18} />
              <span>{t('connectionSuccessful') || 'חיבור הצליח!'}</span>
            </>
          ) : (
            <>
              <BarChart3 size={18} />
              <span>{t('testGA4Connection') || 'בדוק חיבור GA4'}</span>
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`card ${
          message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 flex-row-reverse">
            {message.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0" size={18} />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-900' : 'text-red-900'
            } text-right`}>
              {message.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GA4Connection;

