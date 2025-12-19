declare module '@/services/woocommerce' {
    export const attributesAPI: any;
    export const mediaAPI: any;
    export const productsAPI: any;
    // Add other exports as needed
}

declare module '@/hooks/useWooCommerceSettings' {
    export const useWooCommerceSettings: () => { hasSettings: boolean };
}

declare module '@/hooks/useCategories' {
    export const useCategories: () => { data: any[], isLoading: boolean };
}
