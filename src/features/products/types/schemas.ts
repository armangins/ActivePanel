import { z } from 'zod';

export const productAttributeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Attribute name is required'),
    visible: z.boolean().default(true),
    variation: z.boolean().default(false),
    options: z.array(z.string()).min(1, 'At least one option is required')
});

export const productImageSchema = z.object({
    id: z.number().optional(),
    src: z.string().url('Invalid image URL'),
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
    regular_price: z.string().min(1, 'Price is required'),
    sale_price: z.string().optional(),
    sku: z.string().optional(),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock'),
    stock_quantity: z.number().nullable().optional(),
    manage_stock: z.boolean().default(false),
    image: productImageSchema.optional()
});

export const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    type: z.enum(['simple', 'variable', 'grouped', 'external']).default('simple'),
    status: z.enum(['publish', 'draft', 'pending', 'private']).default('publish'),
    description: z.string().optional(),
    short_description: z.string().optional(),
    sku: z.string().optional(),
    regular_price: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'Invalid price format'),
    sale_price: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'Invalid price format'),
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
    if (data.type === 'simple' && !data.regular_price) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Regular price is required for simple products",
            path: ["regular_price"]
        });
    }
});

export type ProductFormValues = z.infer<typeof productSchema>;
