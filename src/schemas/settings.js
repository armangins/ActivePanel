import { z } from 'zod';

// Helper to clean and validate URL
const urlSchema = z.string()
    .min(1, { message: 'כתובת האתר שדה חובה' })
    .transform((val) => {
        // Remove leading/trailing whitespace and leading slashes
        let cleaned = val.trim();
        // Remove leading slash if present
        if (cleaned.startsWith('/')) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    })
    .refine((val) => {
        // Check if it's a valid URL after cleaning
        try {
            new URL(val);
            return true;
        } catch {
            return false;
        }
    }, { message: 'כתובת האתר אינה תקינה' });

export const settingsSchema = z.object({
    woocommerceUrl: urlSchema,
    storeUrl: z.string().url({ message: 'כתובת האתר אינה תקינה' }).optional(), // Keep for backward compatibility
    consumerKey: z.string()
        .transform((val) => val?.trim() || '')
        .refine((val) => val.length > 0, { message: 'Consumer Key שדה חובה' }),
    consumerSecret: z.string()
        .transform((val) => val?.trim() || '')
        .refine((val) => val.length > 0, { message: 'Consumer Secret שדה חובה' }),
    wordpressUsername: z.string().optional(),
    wordpressAppPassword: z.string().optional(),
    ga4PropertyId: z.string().optional(),
    ga4AccessToken: z.string().optional(),
    geminiApiKey: z.string().optional(),
    lowStockThreshold: z.union([z.string(), z.number()]).optional()
});
