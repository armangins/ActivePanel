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


export const couponResponseSchema = z.object({
    id: z.number(),
    code: z.string(),
    amount: z.string(),
    date_created: z.string(),
    date_created_gmt: z.string(),
    date_modified: z.string(),
    date_modified_gmt: z.string(),
    discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']),
    description: z.string(),
    date_expires: z.string().nullable(),
    date_expires_gmt: z.string().nullable(),
    usage_count: z.number(),
    individual_use: z.boolean(),
    product_ids: z.array(z.number()),
    excluded_product_ids: z.array(z.number()),
    usage_limit: z.number().nullable(),
    usage_limit_per_user: z.number().nullable(),
    limit_usage_to_x_items: z.number().nullable(),
    free_shipping: z.boolean(),
    product_categories: z.array(z.number()),
    excluded_product_categories: z.array(z.number()),
    exclude_sale_items: z.boolean(),
    minimum_amount: z.string(),
    maximum_amount: z.string(),
    email_restrictions: z.array(z.string()),
    used_by: z.array(z.string()),
    meta_data: z.array(z.any())
});

export const couponsResponseSchema = z.object({
    data: z.array(couponResponseSchema),
    total: z.number(),
    totalPages: z.number()
});

export type CouponFormSchema = z.infer<typeof couponSchema>;
