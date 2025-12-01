import { useEffect, useCallback } from 'react';
import { initializeGoogleSignIn, cleanupGoogleScript, decodeGoogleCredential } from '../utils/googleAuth';
import { createOrUpdateGoogleUser } from '../utils/userManagement';

/**
 * Custom hook for Google Sign-In functionality
 * 
 * @param {Function} onSuccess - Callback when sign-in succeeds (receives user object)
 * @param {Function} onError - Callback when sign-in fails (receives error message)
 * @returns {Object} { isLoading, isInitialized }
 */
export const useGoogleSignIn = (onSuccess, onError) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      // Decode Google credential
      const googleUserData = decodeGoogleCredential(response.credential);
      
      // Create or update user in storage
      const user = createOrUpdateGoogleUser(googleUserData);
      
      // Call success callback with user object
      onSuccess(user);
    } catch (error) {
      const errorMessage = error.message || 'שגיאה בהתחברות. אנא נסה שוב.';
      onError(errorMessage);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) {
      // No client ID configured, skip initialization
      return;
    }

    let isMounted = true;

    const initGoogleSignIn = async () => {
      try {
        await initializeGoogleSignIn(clientId, handleCredentialResponse);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to initialize Google Sign-In:', error);
        }
      }
    };

    initGoogleSignIn();

    return () => {
      isMounted = false;
      cleanupGoogleScript();
    };
  }, [clientId, handleCredentialResponse]);

  return {
    isInitialized: !!clientId,
  };
};




