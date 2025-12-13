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
                console.log('[OAuth Debug] Query Params Token:', !!accessToken);

                // 2. Fallback: Try to get token from Hash Fragment (Legacy method)
                if (!accessToken && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    accessToken = hashParams.get('access_token');
                    console.log('[OAuth Debug] Hash Fragment Token:', !!accessToken);
                }

                if (!accessToken) {
                    console.error('[OAuth] Failed to parse access token from URL (both query and hash failed)');
                    console.log('[OAuth Debug] Current URL:', window.location.href);
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
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Login Successful!</h2>
                    <p className="text-gray-600 mb-6">You have been successfully authenticated.</p>

                    <button
                        onClick={() => navigate('/dashboard', { replace: true })}
                        className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors w-full mb-4"
                    >
                        Continue to Dashboard
                    </button>

                    <div className="text-xs text-left bg-gray-100 p-3 rounded overflow-hidden">
                        <p className="font-bold text-gray-500 mb-1">Debug Info (v2.1):</p>
                        <p>Status: Authenticated</p>
                        <p>Storage: {localStorage.getItem('accessToken') ? 'Token Saved (LS)' : 'No Token in LS'}</p>
                        <p className="truncate">Token: {localStorage.getItem('accessToken')?.substring(0, 20)}...</p>
                    </div>
                    <div className="mt-4 text-center text-xs text-gray-300">
                        Build: v2.1 Mobile Fix
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing authentication (v2.1)...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
