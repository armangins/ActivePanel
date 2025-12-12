/**
 * Get Google OAuth URL for authentication
 * Since sign in and sign up do the same thing (auto-create users), we use one endpoint
 */
export const getGoogleAuthUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
  
  // Enforce HTTPS in production
  if (import.meta.env.PROD && apiUrl.startsWith('http://')) {
    console.warn('⚠️  WARNING: API_URL uses HTTP in production. Converting to HTTPS.');
    apiUrl = apiUrl.replace('http://', 'https://');
  }
  
  // VITE_API_URL already includes /api, so just append /auth/google
  // We use the login endpoint since both login and signup do the same thing
  return apiUrl.endsWith('/api') 
    ? `${apiUrl}/auth/google` 
    : `${apiUrl}/api/auth/google`;
};

/**
 * Redirect to Google OAuth
 */
export const redirectToGoogleAuth = () => {
  window.location.href = getGoogleAuthUrl();
};

