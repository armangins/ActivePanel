import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { parseJWTPayload } from '../../utils/jwtParser';

/**
 * OAuth Callback Handler
 * 
 * Handles the OAuth redirect from Google authentication.
 * Extracts the access token from the URL and logs the user in.
 * 
 * SECURITY: Immediately clears the token from URL after extraction to prevent:
 * - Token exposure in browser history
 * - Token logging in server access logs
 * - Token visibility in browser dev tools
 * 
 * NOTE: For enhanced security, consider having the backend use POST requests
 * with tokens in the request body instead of query parameters. This would require
 * backend changes to accept POST /oauth/callback with token in body.
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, accessToken } = useAuth();
    const [processed, setProcessed] = useState(false);
    const [loginCompleted, setLoginCompleted] = useState(false);

    // Handle navigation after authentication state updates
    useEffect(() => {
        if (loginCompleted) {
            // Check both isAuthenticated and direct state values for reliability
            const hasToken = !!accessToken;
            const hasUser = !!user;
            const actuallyAuthenticated = hasUser && hasToken;
            
            if (actuallyAuthenticated || isAuthenticated) {
                // Small delay to ensure state propagation before navigation
                // URL is already cleared in handleOAuthCallback, so we just navigate
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 50);
            } else {
                // Wait for state to update - React batches state updates
                let attempts = 0;
                const maxAttempts = 10;
                const checkAuth = setInterval(() => {
                    attempts++;
                    const currentHasToken = !!accessToken;
                    const currentHasUser = !!user;
                    const currentAuth = currentHasUser && currentHasToken;
                    
                    if (currentAuth || isAuthenticated) {
                        clearInterval(checkAuth);
                        setTimeout(() => {
                            navigate('/dashboard', { replace: true });
                        }, 50);
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkAuth);
                        // URL is already cleared, just navigate to login
                        navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication'));
                    }
                }, 100);
                
                return () => clearInterval(checkAuth);
            }
        }
    }, [loginCompleted, isAuthenticated, navigate, user, accessToken]);

    useEffect(() => {
        if (processed) return;

        const handleOAuthCallback = async () => {
            setProcessed(true);
            let extractedToken = null;
            let extractedUser = null;

            try {
                // OPTION 1: Try to get token from URL (current implementation)
                // This handles the current query parameter-based flow
                // SECURITY: Extract token from URL FIRST, before any async operations
                // 1. Try to get token from Query Params (Preferred/New method)
                const searchParams = new URLSearchParams(window.location.search);
                let accessToken = searchParams.get('access_token');
                const hasTokenInQuery = !!accessToken;

                // 2. Fallback: Try to get token from Hash Fragment (Legacy method)
                if (!accessToken && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    accessToken = hashParams.get('access_token');
                }

                // OPTION 2: If no token in URL, try session verification (if backend uses session storage)
                // This allows backend to store token in session and frontend retrieves it
                let hasPostData = false;
                if (!accessToken) {
                    try {
                        const response = await fetch('/api/auth/oauth/verify', {
                            method: 'POST',
                            credentials: 'include', // Important for cookies/session
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            accessToken = data.accessToken;
                            extractedUser = data.user;
                            hasPostData = true; // Mark that we got data from session
                        }
                    } catch (sessionError) {
                        // Session verification failed, continue with URL check
                        // This is expected if backend hasn't implemented session storage yet
                    }
                }

                if (!accessToken) {
                    // No token found - clear URL and redirect to login
                    window.history.replaceState(null, '', '/oauth/callback');
                    navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to parse access token'));
                    return;
                }

                // SECURITY: Store token and immediately clear it from URL (if it was in URL)
                // This prevents token from being logged in browser history or server logs
                extractedToken = accessToken;
                
                // Clear URL immediately after extraction (before any async operations)
                // Remove both query params and hash fragment to completely clean the URL
                if (!hasPostData) {
                    window.history.replaceState(null, '', '/oauth/callback');
                }

                // If we got user from session, use it; otherwise parse from token
                let user;
                if (extractedUser) {
                    user = extractedUser;
                } else {
                    // Validate and parse JWT token using validated parser
                    const payload = parseJWTPayload(extractedToken);
                    if (!payload) {
                        throw new Error('Invalid or expired token');
                    }

                    // Create user object from validated JWT payload
                    user = {
                        id: payload.userId,
                        email: payload.email || '',
                        role: payload.role || 'user',
                        provider: 'google'
                    };
                }

                // Login with the access token (token is now safely in memory, not in URL)
                await login(user, extractedToken);
                
                // Mark login as completed - navigation will happen in the other effect
                setLoginCompleted(true);

            } catch (error) {
                // Ensure URL is cleared even on error
                window.history.replaceState(null, '', '/oauth/callback');
                navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication'));
            } finally {
                // SECURITY: Clear token from memory reference (though it's already in login function)
                // The token is now stored in localStorage and React state, not in URL
                extractedToken = null;
                extractedUser = null;
            }
        };

        handleOAuthCallback();
    }, [navigate, login, processed]);

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
