import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../providers/SettingsProvider';
import { settingsService } from '../api/settings.service';
import { AuthProvider } from '@/features/auth';

// Mock dependencies
vi.mock('../api/settings.service', () => ({
    settingsService: {
        get: vi.fn(),
        update: vi.fn(),
    }
}));

// Mock Auth
vi.mock('@/features/auth', () => ({
    useAuth: vi.fn(() => ({ isAuthenticated: true })),
    AuthProvider: ({ children }: any) => children,
}));

// Mock Gemini Service
vi.mock('@/services/gemini', () => ({
    setGeminiApiKey: vi.fn(),
}));

describe('SettingsProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches settings on mount if authenticated', async () => {
        const mockSettings = { consumerKey: 'key', hasConsumerKey: true };
        (settingsService.get as any).mockResolvedValue(mockSettings);

        const wrapper = ({ children }: any) => <SettingsProvider>{children}</SettingsProvider>;
        const { result } = renderHook(() => useSettings(), { wrapper });

        // Initial state
        expect(result.current.loading).toBe(true);

        // Wait for fetch
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.settings).toEqual(mockSettings);
    });

    it('updates settings', async () => {
        const mockSettings = { consumerKey: 'key' };
        (settingsService.get as any).mockResolvedValue(mockSettings);
        (settingsService.update as any).mockResolvedValue({ ...mockSettings, consumerKey: 'new-key' });

        const wrapper = ({ children }: any) => <SettingsProvider>{children}</SettingsProvider>;
        const { result } = renderHook(() => useSettings(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.updateSettings({ consumerKey: 'new-key' });
        });

        expect(settingsService.update).toHaveBeenCalledWith({ consumerKey: 'new-key' });
        await waitFor(() => {
            expect(result.current.settings).toEqual({ consumerKey: 'new-key' });
        });
    });
});
