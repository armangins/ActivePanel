import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook to handle authentication errors from URL parameters
 * 
 * Handles OAuth callback errors, error messages, and cleans up URL parameters
 * after processing. Useful for login/signup pages that receive error redirects.
 * 
 * @returns {Object} Object containing:
 *   - error: The error message string (empty if no error)
 *   - setError: Function to manually set error state
 *   - clearError: Function to clear error and clean URL
 */
export const useAuthErrorHandler = () => {
  const { t } = useLanguage();
  const [error, setError] = useState('');

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    const errorCode = urlParams.get('code');
    const success = urlParams.get('success');

    // Handle Google authentication errors
    if (errorParam === 'google_auth_failed' || errorParam === 'אופס, נראה שהיתה בעיה בהתחברות נסה שוב') {
      if (errorMessage) {
        const decodedMessage = decodeURIComponent(errorMessage);
        setError(decodedMessage || t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      } else {
        setError(t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      }
      // Clean up URL params after setting error
      cleanUrlParams();
    } else if (errorParam === 'true') {
      setError(t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      cleanUrlParams();
    }
  }, [t]);

  /**
   * Clean URL parameters from the current URL
   */
  const cleanUrlParams = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  /**
   * Clear error and clean URL parameters
   */
  const clearError = () => {
    setError('');
    cleanUrlParams();
  };

  return {
    error,
    setError,
    clearError,
  };
};

