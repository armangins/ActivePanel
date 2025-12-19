import { api } from '@/services/api';
import { Settings } from '../types';

export const settingsService = {
    get: async (): Promise<Settings> => {
        const response = await api.get('/settings');
        // Backend returns { settings: { ... } } or { settings: null } for new users
        return response.data.settings || response.data || null;
    },

    update: async (data: Partial<Settings>): Promise<Settings> => {
        const response = await api.post('/settings', data);
        // Backend returns { message: "...", settings: { ... } } after save
        return response.data.settings || response.data;
    },

    // Specific endpoints found in legacy code?
    // settingsAPI in api.js has .get() and .update(). 
    // Let's stick to those for now.

    // Helper for Gemini testing? 
    // Services/gemini.js has testGeminiConnection. I should probably migrate that here or keep it separate?
    // Let's might migrate it here to consolidate.
};
