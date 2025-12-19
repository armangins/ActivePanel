export interface VariationAttribute {
    id: number;
    name: string;
    option: string;
}

export interface Variation {
    id: number;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    stock_quantity: number | null;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    attributes: VariationAttribute[];
    image?: {
        id: number;
        src: string;
        alt: string;
    };
}

export interface VariationFormData {
    sku?: string;
    regular_price: string;
    sale_price?: string;
    stock_quantity?: number;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    attributes: VariationAttribute[];
    image_id?: number;
}
