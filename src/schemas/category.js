import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1, { message: 'שם קטגוריה חובה' }),
    slug: z.string().optional(),
    description: z.string().optional(),
    parent: z.number().int().optional(),
    image: z.union([z.object({ id: z.number() }), z.number(), z.null()]).optional()
});
