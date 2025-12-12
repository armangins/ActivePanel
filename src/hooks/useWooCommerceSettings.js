import { useSettings } from '../contexts/SettingsContext';

/**
 * Hook to check if WooCommerce settings are configured
 * Returns whether settings exist and have required credentials
 */
export const useWooCommerceSettings = () => {
  const { settings, loading } = useSettings();
  
  const hasSettings = !!(settings && settings.hasConsumerKey && settings.hasConsumerSecret);
  
  return {
    hasSettings,
    isLoading: loading,
    settings
  };
};

