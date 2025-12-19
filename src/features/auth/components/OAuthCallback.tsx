import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { useAuth } from '../providers/AuthProvider';
import { parseJWTPayload } from '@/utils/jwtParser';
import { User } from '../types';

const { Text } = Typography;

/**
 * OAuth Callback Handler
 * 
 * Handles the OAuth redirect from Google authentication.
 * Extracts the access token from the URL and logs the user in.
 */
export const OAuthCallback = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, accessToken } = useAuth();
    const [processed, setProcessed] = useState(false);
    const [loginCompleted, setLoginCompleted] = useState(false);

    useEffect(() => {
        if (loginCompleted) {
            const hasToken = !!accessToken;
            const hasUser = !!user;
            const actuallyAuthenticated = hasUser && hasToken;

            if (actuallyAuthenticated || isAuthenticated) {
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 50);
            } else {
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
            let extractedToken: string | null = null;
            let extractedUser: User | null = null;

            try {
                const searchParams = new URLSearchParams(window.location.search);
                let accessToken = searchParams.get('access_token');

                if (!accessToken && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    accessToken = hashParams.get('access_token');
                }

                let hasPostData = false;
                if (!accessToken) {
                    try {
                        const response = await fetch('/api/auth/oauth/verify', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            accessToken = data.accessToken;
                            extractedUser = data.user;
                            hasPostData = true;
                        }
                    } catch (sessionError) {
                        // Ignore
                    }
                }

                if (!accessToken) {
                    window.history.replaceState(null, '', '/oauth/callback');
                    navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to parse access token'));
                    return;
                }

                extractedToken = accessToken;

                if (!hasPostData) {
                    window.history.replaceState(null, '', '/oauth/callback');
                }

                let userToUse: User;
                if (extractedUser) {
                    userToUse = extractedUser;
                } else {
                    const payload = parseJWTPayload(extractedToken);
                    if (!payload) {
                        throw new Error('Invalid or expired token');
                    }

                    userToUse = {
                        id: payload.userId,
                        email: payload.email || '',
                        displayName: payload.displayName || payload.name || payload.email || '',
                        role: payload.role || 'user',
                        provider: 'google'
                    };
                }

                await login(userToUse, extractedToken);
                setLoginCompleted(true);

            } catch (error) {
                window.history.replaceState(null, '', '/oauth/callback');
                navigate('/login?error=google_auth_failed&message=' + encodeURIComponent('Failed to complete authentication'));
            }
        };

        handleOAuthCallback();
    }, [navigate, login, processed]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            direction: 'rtl'
        }}>
            <div style={{ textAlign: 'center' }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: 500 }}>
                    אנחנו מאמתים אותך, זה יקח רק רגע...
                </Text>
            </div>
        </div>
    );
};
