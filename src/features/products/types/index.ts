export interface ProductImage {
    id: number;
    src: string;
    name?: string;
    alt?: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    parent?: number;
    count?: number;
    image?: {
        src: string;
    };
}

export interface ProductAttributeOption {
    id: number;
    name: string;
    slug: string;
}

export interface ProductAttribute {
    id: number;
    name: string;
    slug: string;
    position?: number;
    visible: boolean;
    variation: boolean;
    options: string[];
}

export interface ProductVariation {
    id: number;
    image?: ProductImage;
    attributes: {
        id: number;
        name: string;
        option: string;
    }[];
    price: string;
    regular_price: string;
    sale_price: string;
    sku: string;
    stock_status: string;
    stock_quantity: number | null;
    manage_stock: boolean;
    width?: string;
    height?: string;
    length?: string;
    weight?: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    date_created: string;
    date_modified: string;
    type: 'simple' | 'grouped' | 'external' | 'variable';
    status: 'publish' | 'draft' | 'pending' | 'private';
    featured: boolean;
    catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
    description: string;
    short_description: string;
    sku: string;
    price: string;
    currency: string;
    regular_price: string;
    sale_price: string;
    date_on_sale_from: string | null;
    date_on_sale_to: string | null;
    price_html: string;
    on_sale: boolean;
    purchasable: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    downloads: any[];
    download_limit: number;
    download_expiry: number;
    external_url: string;
    button_text: string;
    tax_status: 'taxable' | 'shipping' | 'none';
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    backorders: 'no' | 'notify' | 'yes';
    backorders_allowed: boolean;
    backordered: boolean;
    sold_individually: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_required: boolean;
    shipping_taxable: boolean;
    shipping_class: string;
    shipping_class_id: number;
    reviews_allowed: boolean;
    average_rating: string;
    rating_count: number;
    related_ids: number[];
    upsell_ids: number[];
    cross_sell_ids: number[];
    parent_id: number;
    purchase_note: string;
    categories: ProductCategory[];
    tags: any[];
    images: ProductImage[];
    attributes: ProductAttribute[];
    default_attributes: any[];
    variations: number[];
    grouped_products: number[];
    menu_order: number;
    meta_data: any[];
    // Extended properties
    variations_data?: ProductVariation[]; // For our UI to store fetched variations
}

export interface ProductsResponse {
    data: Product[];
    total: number;
    totalPages: number;
}

export interface CreateProductData {
    name: string;
    type: string;
    regular_price?: string;
    sale_price?: string;
    description?: string;
    short_description?: string;
    categories?: { id: number }[];
    images?: { src: string }[];
    attributes?: ProductAttribute[];
    // ... other fields
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id: number;
}
