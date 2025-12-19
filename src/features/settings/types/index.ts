import { z } from 'zod';


export const settingsSchema = z.object({
    woocommerceUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    consumerKey: z.string().optional(),
    consumerSecret: z.string().optional(),
    wordpressUsername: z.string().optional(),
    wordpressAppPassword: z.string().optional(),
    ga4PropertyId: z.string().optional(),
    ga4MeasurementId: z.string().optional(),
    ga4ApiSecret: z.string().optional(),
    geminiApiKey: z.string().optional(),
    lowStockThreshold: z.number().optional().or(z.string().transform(val => parseInt(val, 10))), // Allow string input but transform to number
});

export interface Settings {
    // ... existing fields ...
    woocommerceUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    wordpressUsername?: string;
    wordpressAppPassword?: string;

    // Status flags
    hasConsumerKey?: boolean;
    hasConsumerSecret?: boolean;
    hasWordpressUsername?: boolean;
    hasWordpressAppPassword?: boolean;

    // GA4
    ga4PropertyId?: string;
    ga4MeasurementId?: string;
    ga4ApiSecret?: string;

    // Gemini
    geminiApiKey?: string;
    hasGeminiApiKey?: boolean;

    // Product
    lowStockThreshold?: number;

    [key: string]: any;
}

export type SettingsFormData = z.infer<typeof settingsSchema>;

export interface SettingsState {
    settings: Settings | null;
    loading: boolean;
    error: Error | null;
    updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
    fetchSettings: () => Promise<void>;
}
