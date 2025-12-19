export interface CustomerBilling {
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

export interface CustomerShipping {
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

export interface Customer {
    id: number;
    date_created: string;
    date_modified: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    username: string;
    billing: CustomerBilling;
    shipping: CustomerShipping;
    is_paying_customer: boolean;
    avatar_url: string;
    meta_data: any[];
    orders_count?: number; // Optional as it might come from a separate aggregate or custom field
    total_spent?: string;
}

export interface CustomersResponse {
    data: Customer[];
    total: number;
    totalPages: number;
}


export interface CustomersState {
    customers: Customer[];
    total: number;
    loading: boolean;
    error: Error | null;
}
