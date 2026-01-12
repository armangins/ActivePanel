import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '../api/settings.service';
import { useAuth } from '@/features/auth';
import { Settings, SettingsState } from '../types';
// @ts-ignore - legacy service
import { setGeminiApiKey } from '@/services/gemini';

const SettingsContext = createContext<SettingsState | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loading = authLoading || isFetching;

    const fetchSettings = async () => {
        if (!isAuthenticated) return;

        try {
            setIsFetching(true);
            const data = await settingsService.get();
            setSettings(data || null);
            if (data?.geminiApiKey) {
                setGeminiApiKey(data.geminiApiKey);
            }
            setError(null);
        } catch (err: any) {
            // Handle 404 as "no settings yet" -> null
            if (err.response?.status === 404) {
                setSettings(null);
                setError(null);
            } else {
                console.error('Failed to load settings:', err);
                setError(err);
                setSettings(null);
            }
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
        } else {
            setSettings(null);
        }
    }, [isAuthenticated]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            setIsFetching(true);
            const updated = await settingsService.update(newSettings);
            setSettings(updated);
            if (updated?.geminiApiKey) {
                setGeminiApiKey(updated.geminiApiKey);
            }
            return updated;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, error, updateSettings, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
