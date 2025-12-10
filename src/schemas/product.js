import { z } from 'zod';

const priceSchema = z.union([z.string(), z.number()]).optional().transform(val => (val === '' || val === null || val === undefined) ? undefined : String(val));

export const productSchema = z.object({
    product_name: z.string().min(1, { message: 'נא להזין שם מוצר' }),
    type: z.enum(['simple', 'variable', 'grouped', 'external']).default('simple'),
    status: z.enum(['draft', 'publish', 'private', 'pending']).default('draft'),
    description: z.string().optional(),
    short_description: z.string().optional(),
    sku: z.string().optional(),
    regular_price: priceSchema,
    sale_price: priceSchema,
    manage_stock: z.boolean().default(true),
    stock_quantity: z.union([z.string(), z.number(), z.null()]).optional(),
    categories: z.array(z.union([z.object({ id: z.number() }), z.number()])).optional(),
    images: z.array(z.object({ id: z.number() })).optional(),
}).superRefine((data, ctx) => {
    if (data.status !== 'draft') {
        if (!data.regular_price) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'מחיר רגיל חובה',
                path: ['regular_price']
            });
        }
        if (data.manage_stock && (data.stock_quantity === undefined || data.stock_quantity === null || data.stock_quantity === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'כמות במלאי חובה',
                path: ['stock_quantity']
            });
        }
    }
});

export const variationSchema = z.object({
    regular_price: priceSchema,
    sale_price: priceSchema,
    sku: z.string().optional(),
    manage_stock: z.boolean().optional(),
    stock_quantity: z.union([z.string(), z.number(), z.null()]).optional(),
    attributes: z.array(z.object({
        id: z.number(),
        name: z.string().optional(),
        option: z.string()
    })).optional()
});
