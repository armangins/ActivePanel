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
                // 1. Try to get token from Query Params (Preferred/New method)
                const searchParams = new URLSearchParams(window.location.search);
                let accessToken = searchParams.get('access_token');

                // 2. Fallback: Try to get token from Hash Fragment (Legacy method)
                if (!accessToken && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    accessToken = hashParams.get('access_token');
                }

                if (!accessToken) {
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

                // Clear the URL fragment for security and redirect
                window.history.replaceState(null, '', '/dashboard');
                navigate('/dashboard', { replace: true });

            } catch (error) {
                console.error('[OAuth] Error handling callback:', error);
                navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication'));
            }
        };

        handleOAuthCallback();
    }, [navigate, login, loading, processed]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">אנחנו מאמתים אותך, זה יקח רק רגע...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
