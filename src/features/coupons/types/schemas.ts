import { z } from 'zod';

export const couponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required').trim(),
    description: z.string().optional(),
    discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']),
    amount: z.string().min(0, 'Amount must be positive').refine((val) => !isNaN(parseFloat(val)), 'Invalid amount'),
    date_expires: z.string().nullable().optional(),
    free_shipping: z.boolean().default(false),
    individual_use: z.boolean().default(false),
    exclude_sale_items: z.boolean().default(false),
    minimum_amount: z.string().optional(),
    maximum_amount: z.string().optional(),
    product_ids: z.array(z.number()).optional(),
    excluded_product_ids: z.array(z.number()).optional(),
    product_categories: z.array(z.number()).optional(),
    excluded_product_categories: z.array(z.number()).optional(),
    email_restrictions: z.array(z.string().email('Invalid email')).optional(),
    usage_limit: z.number().int().min(0).nullable().optional(),
    usage_limit_per_user: z.number().int().min(0).nullable().optional(),
});

export type CouponFormSchema = z.infer<typeof couponSchema>;
