import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OAuth Callback Handler
 * 
 * Handles the OAuth redirect from Google authentication.
 * Extracts the access token from the URL fragment and logs the user in.
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [processed, setProcessed] = useState(false);


    useEffect(() => {
        if (loading || processed) return;

        const handleOAuthCallback = async () => {
            setProcessed(true);
            try {

                const hash = window.location.hash;

                if (!hash || !hash.includes('access_token=')) {
                    console.error('[OAuth] No access token in URL fragment');
                    navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('No access token received'));
                    return;
                }

                // Parse the access token from the fragment
                const params = new URLSearchParams(hash.substring(1)); // Remove the # and parse
                const accessToken = params.get('access_token');

                if (!accessToken) {
                    console.error('[OAuth] Failed to parse access token');
                    navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to parse access token'));
                    return;
                }

                // Decode the JWT to get user info (without verification - just for display)
                const payloadStart = accessToken.split('.')[1];
                if (!payloadStart) {
                    throw new Error('Invalid token format');
                }
                const payload = JSON.parse(atob(payloadStart));

                // Create user object from JWT payload
                const user = {
                    id: payload.userId,
                    email: payload.email,
                    role: payload.role,
                    provider: 'google'
                };

                // Login with the access token
                await login(user, accessToken);

                // Clear the URL fragment for security
                window.history.replaceState(null, '', '/dashboard');

                // DO NOT redirect immediately - wait for user confirmation
                // This allows us to verify if the login state (e.g. header) updated correctly
                // navigate('/dashboard', { replace: true });
                setProcessed(true); // Ensure we don't re-run
            } catch (error) {
                console.error('[OAuth] Error handling callback:', error);
                navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication: ' + error.message));
            }
        };

        handleOAuthCallback();
    }, [navigate, login, loading, processed]);

    if (processed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Login Successful!</h2>
                    <p className="text-gray-600 mb-6">You have been successfully authenticated.</p>
                    <button
                        onClick={() => navigate('/dashboard', { replace: true })}
                        className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                        Continue to Dashboard
                    </button>
                    <p className="text-sm text-gray-400 mt-4">
                        Check the top right corner - you should see your profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
