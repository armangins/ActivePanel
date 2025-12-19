import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SettingsProvider } from '@/features/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth';
import { vi } from 'vitest';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

// Mock the auth service used by AuthProvider to avoid side effects
vi.mock('@/features/auth/api/auth.service', () => ({
    authService: {
        getCurrentUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        refreshToken: vi.fn().mockResolvedValue({ accessToken: 'test-token' })
    }
}));

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MockAuthProvider>
                    <LanguageProvider>
                        <SettingsProvider>
                            {children}
                        </SettingsProvider>
                    </LanguageProvider>
                </MockAuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};
