export interface Coupon {
    id: number;
    code: string;
    amount: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
    description: string;
    date_expires: string | null;
    date_expires_gmt: string | null;
    usage_count: number;
    individual_use: boolean;
    product_ids: number[];
    excluded_product_ids: number[];
    usage_limit: number | null;
    usage_limit_per_user: number | null;
    limit_usage_to_x_items: number | null;
    free_shipping: boolean;
    product_categories: number[];
    excluded_product_categories: number[];
    exclude_sale_items: boolean;
    minimum_amount: string;
    maximum_amount: string;
    email_restrictions: string[];
    used_by: string[];
    meta_data: any[];
}

export interface CouponFormValues {
    code: string;
    description?: string;
    discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
    amount: string;
    date_expires?: string | null;
    free_shipping: boolean;
    individual_use: boolean;
    exclude_sale_items: boolean;
    minimum_amount?: string;
    maximum_amount?: string;
    product_ids?: number[];
    excluded_product_ids?: number[];
    product_categories?: number[];
    excluded_product_categories?: number[];
    email_restrictions?: string[];
    usage_limit?: number | null;
    usage_limit_per_user?: number | null;
}

export interface CouponsResponse {
    data: Coupon[];
    total: number;
    totalPages: number;
}
