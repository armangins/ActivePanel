import { z } from 'zod';

const priceSchema = z
    .union([z.string(), z.number(), z.null()])
    .transform(val => {
        // Handle null, undefined, and empty string
        if (val === '' || val === null || val === undefined) return undefined;
        return String(val).trim();
    })
    .refine(val => val !== undefined && val !== '', {
        message: 'יש להזין מחיר'
    })
    .refine(val => {
        if (val === undefined) return true;
        // Remove any non-numeric characters except decimal point and minus sign for validation
        const sanitized = val.replace(/[^\d.-]/g, '');
        const num = parseFloat(sanitized);
        return !isNaN(num) && isFinite(num);
    }, {
        message: 'יש להזין מספר תקין'
    })
    .refine(val => {
        if (val === undefined) return true;
        // Re-sanitize for parsing in this refine, as previous refine only sanitized for its own check
        const sanitizedVal = val.replace(/[^\d.-]/g, '');
        const num = parseFloat(sanitizedVal);
        return num >= 0 && num <= 999999999.99;
    }, {
        message: 'המחיר חייב להיות בין 0 ל-999,999,999.99'
    })
    .transform(val => {
        if (val === undefined) return undefined;
        // Final sanitization after validation passes
        let sanitized = val.replace(/[^\d.-]/g, '');

        // Prevent multiple decimal points
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }

        // Ensure only 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            sanitized = parts[0] + '.' + parts[1].substring(0, 2);
        }

        return sanitized;
    });

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
                message: 'יש להזין מחיר',
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
