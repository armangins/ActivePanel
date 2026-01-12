import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/auth.service';
import { setAuthToken, setOnRefreshSuccess } from '@/services/api';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    // Inject token into interceptors synchronously
    useLayoutEffect(() => {
        setAuthToken(accessToken);
    }, [accessToken]);

    // Sync refresh token success
    useEffect(() => {
        setOnRefreshSuccess((newToken: string) => {
            setAccessToken(newToken);
        });
        return () => setOnRefreshSuccess(null);
    }, []);

    // Initial Auth Check
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const response = await authService.refreshToken();

                if (response.accessToken && isMounted) {
                    setAccessToken(response.accessToken);

                    try {
                        const userData = await authService.getCurrentUser();
                        if (isMounted) {
                            setUser(userData);
                        }
                    } catch (userError) {
                        console.error('Failed to fetch user profile after refresh:', userError);
                    }
                }
            } catch (error) {
                // Failed to refresh - user is not authenticated
                if (isMounted) {
                    setAccessToken(null);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = useCallback(async (userData: User, token: string) => {
        setLoading(true);
        try {
            if (token) setAccessToken(token);
            if (userData) setUser(userData);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (e) {
            // Ignore errors
        } finally {
            setAccessToken(null);
            setUser(null);

            // Critical: Clear all cached data to prevent leakage between users
            queryClient.clear();

            setLoading(false);
        }
    }, [queryClient]);

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await authService.refreshToken();
            if (response.accessToken) {
                setAccessToken(response.accessToken);
                return response.accessToken;
            }
        } catch (error) {
            setAccessToken(null);
            setUser(null);
            queryClient.clear(); // Clear cache if refresh fails (forced logout)
            throw error;
        }
    }, [queryClient]);

    const getToken = useCallback(() => accessToken, [accessToken]);

    const isAuthenticated = useMemo(() => !!accessToken && !!user, [accessToken, user]);

    const value = useMemo(() => ({
        user,
        accessToken,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshAccessToken,
        getToken
    }), [user, accessToken, loading, isAuthenticated, login, logout, refreshAccessToken, getToken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
