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

                // Redirect to dashboard
                navigate('/dashboard', { replace: true });
            } catch (error) {
                console.error('[OAuth] Error handling callback:', error);
                navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication: ' + error.message));
            }
        };

        handleOAuthCallback();
    }, [navigate, login, loading, processed]);

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
