export interface OrderBilling {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
}

export interface OrderShipping {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

export interface OrderLineItem {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
    sku: string;
    price: number;
    image: {
        id: string;
        src: string;
    };
    parent_name: string | null;
}

export interface Order {
    id: number;
    parent_id: number;
    status: string; // 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed'
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;
    billing: OrderBilling;
    shipping: OrderShipping;
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;
    date_completed: string | null;
    date_paid: string | null;
    cart_hash: string;
    number: string;
    meta_data: any[];
    line_items: OrderLineItem[];
    tax_lines: any[];
    shipping_lines: any[];
    fee_lines: any[];
    coupon_lines: any[];
    refunds: any[];
    payment_url?: string;
    is_editable?: boolean;
    needs_payment?: boolean;
    needs_processing?: boolean;
}

export interface OrdersResponse {
    data: Order[];
    total: number;
    totalPages: number;
}
