import { z } from 'zod';

export const settingsSchema = z.object({
    storeUrl: z.string().url({ message: 'כתובת האתר אינה תקינה' }),
    consumerKey: z.string().min(1, { message: 'Consumer Key שדה חובה' }),
    consumerSecret: z.string().min(1, { message: 'Consumer Secret שדה חובה' }),
    wordpressUsername: z.string().optional(),
    wordpressAppPassword: z.string().optional(),
    ga4PropertyId: z.string().optional(),
    ga4AccessToken: z.string().optional(),
    geminiApiKey: z.string().optional(),
    lowStockThreshold: z.union([z.string(), z.number()]).optional()
});
