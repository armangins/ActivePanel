import { z } from 'zod';

export const orderBillingSchema = z.object({
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

export const orderShippingSchema = z.object({
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

export const orderLineItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    product_id: z.number(),
    variation_id: z.number(),
    quantity: z.number(),
    tax_class: z.string(),
    subtotal: z.string(),
    subtotal_tax: z.string(),
    total: z.string(),
    total_tax: z.string(),
    taxes: z.array(z.any()),
    meta_data: z.array(z.any()),
    sku: z.string(),
    price: z.number(),
    image: z.object({
        id: z.union([z.string(), z.number()]).transform(val => String(val)),
        src: z.string()
    }),
    parent_name: z.string().nullable()
});

export const orderSchema = z.object({
    id: z.number(),
    parent_id: z.number(),
    status: z.string(),
    currency: z.string(),
    version: z.string(),
    prices_include_tax: z.boolean(),
    date_created: z.string(),
    date_modified: z.string(),
    discount_total: z.string(),
    discount_tax: z.string(),
    shipping_total: z.string(),
    shipping_tax: z.string(),
    cart_tax: z.string(),
    total: z.string(),
    total_tax: z.string(),
    customer_id: z.number(),
    order_key: z.string(),
    billing: orderBillingSchema,
    shipping: orderShippingSchema,
    payment_method: z.string(),
    payment_method_title: z.string(),
    transaction_id: z.string(),
    customer_ip_address: z.string(),
    customer_user_agent: z.string(),
    created_via: z.string(),
    customer_note: z.string(),
    date_completed: z.string().nullable(),
    date_paid: z.string().nullable(),
    cart_hash: z.string(),
    number: z.string(),
    meta_data: z.array(z.any()),
    line_items: z.array(orderLineItemSchema),
    tax_lines: z.array(z.any()),
    shipping_lines: z.array(z.any()),
    fee_lines: z.array(z.any()),
    coupon_lines: z.array(z.any()),
    refunds: z.array(z.any()),
    payment_url: z.string().optional(),
    is_editable: z.boolean().optional(),
    needs_payment: z.boolean().optional(),
    needs_processing: z.boolean().optional()
});

export const ordersResponseSchema = z.object({
    data: z.array(orderSchema),
    total: z.number(),
    totalPages: z.number()
});
