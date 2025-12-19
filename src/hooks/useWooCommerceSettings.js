import { useSettings } from '@/features/settings';
import { secureLog } from '../utils/logger';

/**
 * Hook to check if WooCommerce settings are configured
 * Returns whether settings exist and have required credentials
 */
export const useWooCommerceSettings = () => {
  const { settings, loading } = useSettings();

  // Check for both boolean flags and actual values
  // Safely check if consumerKey exists and is not empty
  const consumerKeyValue = settings?.consumerKey;
  const hasConsumerKey = settings?.hasConsumerKey || !!(consumerKeyValue && typeof consumerKeyValue === 'string' && consumerKeyValue.trim().length > 0);

  // Safely check if consumerSecret exists and is not empty
  const consumerSecretValue = settings?.consumerSecret;
  const hasConsumerSecret = settings?.hasConsumerSecret || !!(consumerSecretValue && typeof consumerSecretValue === 'string' && consumerSecretValue.trim().length > 0);

  const hasSettings = !!(settings && hasConsumerKey && hasConsumerSecret);

  // Debug logging in development
  if (import.meta.env.DEV && settings) {
    secureLog.debug('Settings check:', {
      hasConsumerKeyFlag: settings.hasConsumerKey,
      hasConsumerSecretFlag: settings.hasConsumerSecret,
      consumerKeyExists: !!consumerKeyValue,
      consumerSecretExists: !!consumerSecretValue,
      hasConsumerKey,
      hasConsumerSecret,
      hasSettings,
      settingsKeys: Object.keys(settings)
    });
  }

  return {
    hasSettings,
    isLoading: loading,
    settings
  };
};

