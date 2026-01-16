import { z } from 'zod';

export const customerBillingSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string(),
    email: z.string().email(),
    phone: z.string()
});

export const customerShippingSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string()
});

export const customerSchema = z.object({
    id: z.number(),
    date_created: z.string(),
    date_modified: z.string(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    role: z.string(),
    username: z.string(),
    billing: customerBillingSchema,
    shipping: customerShippingSchema,
    is_paying_customer: z.boolean(),
    avatar_url: z.string(),
    meta_data: z.array(z.any()),
    orders_count: z.number().optional(),
    total_spent: z.string().optional(),
    completed_orders_count: z.number().optional(),
    avg_purchase: z.string().optional()
});

export const customersResponseSchema = z.object({
    data: z.array(customerSchema),
    total: z.number(),
    totalPages: z.number()
});
