import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { secureLog } from '../utils/logger';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSettings = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const data = await settingsAPI.get();
            // Handle null settings (new users) gracefully
            setSettings(data || null);
            setError(null);
        } catch (err) {
            // Only log unexpected errors (not 404s which are now handled as null)
            if (err.response?.status !== 404) {
                secureLog.error('Failed to load settings:', err);
            }
            setError(err.response?.status === 404 ? null : err);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch settings when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
        } else {
            setSettings(null);
        }
    }, [isAuthenticated]);

    const updateSettings = async (newSettings) => {
        try {
            setLoading(true);
            const updated = await settingsAPI.update(newSettings);
            setSettings(updated);
            return updated;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
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
