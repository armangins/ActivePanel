import { z } from 'zod';

export const productAttributeSchema = z.object({
    id: z.number().optional().default(0),
    name: z.string().min(1, 'שם התכונה נדרש'),
    slug: z.string().optional().default(''),
    position: z.number().optional().default(0),
    visible: z.boolean().default(true),
    variation: z.boolean().default(false),
    options: z.array(z.string()).min(1, 'נדרשת לפחות אפשרות אחת')
});

export const productImageSchema = z.object({
    id: z.number().optional().default(0),
    src: z.string().optional().default(''),
    name: z.string().optional(),
    alt: z.string().optional()
});

export const productVariationSchema = z.object({
    id: z.number().optional().default(0),
    attributes: z.array(z.object({
        id: z.number(),
        name: z.string(),
        option: z.string()
    })),
    regular_price: z.string().min(1, 'מחיר נדרש'),
    sale_price: z.string().optional().default(''),
    price: z.string().optional().default(''),
    sku: z.string().optional().default(''),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock').catch('instock'),
    stock_quantity: z.number().nullable().optional().transform(v => v ?? null),
    manage_stock: z.boolean().default(false),
    weight: z.string().optional().default(''),
    length: z.string().optional().default(''),
    width: z.string().optional().default(''),
    height: z.string().optional().default(''),
    // Allow image to be strict schema (API data) or any (File object for upload)
    image: z.union([productImageSchema, z.any()]).optional()
});

export const productSchema = z.object({
    name: z.string().min(3, 'שם המוצר חייב להכיל לפחות 3 תווים'),
    type: z.enum(['simple', 'variable', 'grouped', 'external']).default('simple').catch('simple'),
    status: z.enum(['publish', 'draft', 'pending', 'private']).default('publish').catch('publish'),
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

// Schema for API Responses (looser than form validation)
export const productResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().optional().default(''),
    permalink: z.string().optional().default(''),
    date_created: z.string().optional().default(''),
    date_modified: z.string().optional().default(''),
    type: z.enum(['simple', 'grouped', 'external', 'variable']).catch('simple'),
    status: z.enum(['publish', 'draft', 'pending', 'private']).catch('publish'),
    featured: z.boolean().optional().default(false),
    catalog_visibility: z.enum(['visible', 'catalog', 'search', 'hidden']).catch('visible'),
    description: z.string().optional().default(''),
    short_description: z.string().optional().default(''),
    sku: z.string().optional().transform(v => v || ''),
    price: z.string().nullable().optional().transform(v => v || ''),
    currency: z.string().optional().transform(v => v || 'ILS'),
    regular_price: z.string().nullable().optional().transform(v => v || ''),
    sale_price: z.string().nullable().optional().transform(v => v || ''),
    date_on_sale_from: z.string().nullable().optional().transform(v => v ?? null),
    date_on_sale_to: z.string().nullable().optional().transform(v => v ?? null),
    price_html: z.string().optional().transform(v => v || ''),
    on_sale: z.boolean().default(false),
    purchasable: z.boolean().default(true),
    total_sales: z.number().optional().default(0),
    virtual: z.boolean().default(false),
    downloadable: z.boolean().default(false),
    downloads: z.array(z.any()).optional().default([]),
    download_limit: z.number().optional().default(-1),
    download_expiry: z.number().optional().default(-1),
    external_url: z.string().optional().default(''),
    button_text: z.string().optional().default(''),
    tax_status: z.enum(['taxable', 'shipping', 'none']).optional().default('taxable'),
    tax_class: z.string().optional().default(''),
    manage_stock: z.boolean().default(false),
    stock_quantity: z.number().nullable().optional().transform(v => v ?? null),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock'),
    backorders: z.enum(['no', 'notify', 'yes']).optional().default('no'),
    backorders_allowed: z.boolean().optional().default(false),
    backordered: z.boolean().optional().default(false),
    sold_individually: z.boolean().optional().default(false),
    weight: z.string().optional().default(''),
    dimensions: z.object({
        length: z.string().optional().default(''),
        width: z.string().optional().default(''),
        height: z.string().optional().default('')
    }).optional().default({ length: '', width: '', height: '' }),
    shipping_required: z.boolean().optional().default(true),
    shipping_taxable: z.boolean().optional().default(true),
    shipping_class: z.string().optional().default(''),
    shipping_class_id: z.number().optional().default(0),
    reviews_allowed: z.boolean().optional().default(true),
    average_rating: z.string().optional().default('0.00'),
    rating_count: z.number().optional().default(0),
    related_ids: z.array(z.number()).optional().default([]),
    upsell_ids: z.array(z.number()).optional().default([]),
    cross_sell_ids: z.array(z.number()).optional().default([]),
    parent_id: z.number().optional().default(0),
    purchase_note: z.string().optional().default(''),
    categories: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    })).optional().default([]),
    tags: z.array(z.any()).optional().default([]),
    images: z.array(productImageSchema).optional().default([]),
    attributes: z.array(productAttributeSchema).optional().default([]),
    default_attributes: z.array(z.any()).optional().default([]),
    variations: z.array(z.number()).optional().default([]),
    grouped_products: z.array(z.number()).optional().default([]),
    menu_order: z.number().optional().default(0),
    meta_data: z.array(z.any()).optional().default([]),
    variations_data: z.array(productVariationSchema).optional().default([])
});

export const productsResponseSchema = z.object({
    data: z.array(productResponseSchema),
    total: z.number(),
    totalPages: z.number()
});

export type ProductVariation = z.infer<typeof productVariationSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
