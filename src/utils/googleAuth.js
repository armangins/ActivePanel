/**
 * Google Authentication Utilities
 * 
 * Utilities for handling Google Sign-In functionality,
 * including script loading, initialization, and credential processing.
 */

/**
 * Decode JWT token from Google credential response
 * @param {string} credential - JWT token from Google
 * @returns {Object} Decoded user data
 */
export const decodeGoogleCredential = (credential) => {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('שגיאה בפענוח נתוני Google');
  }
};

/**
 * Load Google Identity Services script
 * @returns {Promise<void>}
 */
export const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }
      // Script exists but not loaded yet, wait for it
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.body.appendChild(script);
  });
};

/**
 * Initialize Google Sign-In button
 * @param {string} clientId - Google OAuth Client ID
 * @param {Function} callback - Callback function for credential response
 * @param {string} buttonId - ID of the button element
 * @returns {Promise<void>}
 */
export const initializeGoogleSignIn = async (clientId, callback, buttonId = 'google-signin-button') => {
  if (!clientId) {
    throw new Error('Google Client ID is required');
  }

  await loadGoogleScript();

  if (!window.google || !window.google.accounts) {
    throw new Error('Google Identity Services not available');
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
  });

  const buttonElement = document.getElementById(buttonId);
  if (buttonElement) {
    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'he',
      width: '100%',
    });
  }
};

/**
 * Clean up Google Sign-In script
 */
export const cleanupGoogleScript = () => {
  const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if (existingScript && existingScript.parentNode) {
    existingScript.parentNode.removeChild(existingScript);
  }
};




