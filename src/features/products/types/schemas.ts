import { z } from 'zod';

export const productAttributeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'שם התכונה נדרש'),
    visible: z.boolean().default(true),
    variation: z.boolean().default(false),
    options: z.array(z.string()).min(1, 'נדרשת לפחות אפשרות אחת')
});

export const productImageSchema = z.object({
    id: z.number().optional(),
    src: z.string().url('כתובת URL לא תקינה'),
    name: z.string().optional(),
    alt: z.string().optional()
});

export const productVariationSchema = z.object({
    id: z.number().optional(),
    attributes: z.array(z.object({
        id: z.number(),
        name: z.string(),
        option: z.string()
    })),
    regular_price: z.string().min(1, 'מחיר נדרש'),
    sale_price: z.string().optional(),
    sku: z.string().optional(),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock'),
    stock_quantity: z.number().nullable().optional(),
    manage_stock: z.boolean().default(false),
    // Allow image to be strict schema (API data) or any (File object for upload)
    image: z.union([productImageSchema, z.any()]).optional()
});

export const productSchema = z.object({
    name: z.string().min(3, 'שם המוצר חייב להכיל לפחות 3 תווים'),
    type: z.enum(['simple', 'variable', 'grouped', 'external']).default('simple'),
    status: z.enum(['publish', 'draft', 'pending', 'private']).default('publish'),
    description: z.string().optional(),
    short_description: z.string().optional(),
    sku: z.string().optional(),
    regular_price: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'פורמט מחיר לא תקין'),
    sale_price: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'פורמט מחיר לא תקין'),
    date_on_sale_from: z.string().nullable().optional(),
    date_on_sale_to: z.string().nullable().optional(),
    manage_stock: z.boolean().default(false),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock'),
    stock_quantity: z.number().nullable().optional(),
    categories: z.array(z.object({ id: z.number() })).optional(),
    images: z.array(productImageSchema).optional(),
    attributes: z.array(productAttributeSchema).optional(),
    variations: z.array(productVariationSchema).optional(), // Use a more strictly defined variation structure if needed

    // Virtual/Downloadable
    virtual: z.boolean().default(false),
    downloadable: z.boolean().default(false),

    // Shipping
    weight: z.string().optional(),
    dimensions: z.object({
        length: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional()
    }).optional()
}).superRefine((data, ctx) => {
    // Variable products must have at least one variation
    if (data.type === 'variable') {
        if (!data.variations || data.variations.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "מוצר משתנה חייב להכיל לפחות וריאציה אחת",
                path: ["variations"]
            });
        }
    }

    // Regular price is required for simple products only
    // Variable products get their price from variations
    if (data.type !== 'variable' && (!data.regular_price || data.regular_price.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "מחיר רגיל נדרש",
            path: ["regular_price"]
        });
    }

    // Stock quantity is required when stock management is enabled
    if (data.manage_stock && (data.stock_quantity === null || data.stock_quantity === undefined || data.stock_quantity <= 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "כמות במלאי חייבת להיות גדולה מ-0",
            path: ["stock_quantity"]
        });
    }

    // Validate each variation has required fields
    if (data.type === 'variable' && data.variations) {
        data.variations.forEach((variation, index) => {
            if (!variation.regular_price || variation.regular_price.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "מחיר רגיל נדרש",
                    path: ["variations", index, "regular_price"]
                });
            }

            if (variation.manage_stock && (variation.stock_quantity === null || variation.stock_quantity === undefined || variation.stock_quantity <= 0)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "כמות במלאי חייבת להיות גדולה מ-0",
                    path: ["variations", index, "stock_quantity"]
                });
            }
        });
    }
});

export type ProductVariation = z.infer<typeof productVariationSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
