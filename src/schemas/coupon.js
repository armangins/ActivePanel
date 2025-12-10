import { z } from 'zod';

export const couponSchema = z.object({
    code: z.string().min(1, { message: 'קוד קופון חובה' }),
    amount: z.union([z.string().min(1, { message: 'סכום חובה' }), z.number()], { message: 'סכום לא תקין' }),
    discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']).default('fixed_cart'),
    description: z.string().optional(),
    date_expires: z.string().optional().nullable(),
    usage_limit: z.union([z.string(), z.number(), z.null()]).optional(),
    usage_limit_per_user: z.union([z.string(), z.number(), z.null()]).optional(),
    minimum_amount: z.string().optional(),
    maximum_amount: z.string().optional(),
    free_shipping: z.boolean().optional()
});
