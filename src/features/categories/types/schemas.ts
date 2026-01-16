import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().optional(),
    parent: z.union([z.number(), z.string()]).transform(val => Number(val)).optional(),
    description: z.string().optional(),
    display: z.string().optional(),
});


export const categoryResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    parent: z.number(),
    description: z.string(),
    display: z.string().optional(),
    image: z.object({
        id: z.number(),
        src: z.string(),
        name: z.string(),
        alt: z.string()
    }).nullable().optional(),
    menu_order: z.number().optional(),
    count: z.number(),
    _links: z.any().optional()
});

export const categoriesResponseSchema = z.array(categoryResponseSchema);

export type CategoryFormSchema = z.infer<typeof categorySchema>;
