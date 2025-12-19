import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().optional(),
    parent: z.union([z.number(), z.string()]).transform(val => Number(val)).optional(),
    description: z.string().optional(),
    display: z.string().optional(),
});

export type CategoryFormSchema = z.infer<typeof categorySchema>;
