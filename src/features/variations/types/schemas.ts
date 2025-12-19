import { z } from 'zod';

export const variationAttributeSchema = z.object({
    id: z.number(),
    name: z.string(),
    option: z.string().min(1, 'Option is required')
});

export const variationSchema = z.object({
    sku: z.string().optional(),
    regular_price: z.string().min(1, 'Regular price is required'),
    sale_price: z.string().optional(),
    stock_quantity: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).default('instock'),
    attributes: z.array(variationAttributeSchema).min(1, 'At least one attribute is required'),
    image_id: z.number().optional()
});

export type VariationFormSchema = z.infer<typeof variationSchema>;
