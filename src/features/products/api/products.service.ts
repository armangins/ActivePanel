import { productsAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { Product, ProductsResponse, CreateProductData, UpdateProductData } from '../types';

export const productsService = {
    async getProducts(params: {
        page?: number;
        per_page?: number;
        search?: string;
        category?: number;
        status?: string;
        min_price?: string;
        max_price?: string;
        sku?: string;
    } = {}): Promise<ProductsResponse> {
        try {
            const apiParams: any = {
                page: params.page || 1,
                per_page: params.per_page || 10,
                search: params.search || '',
                status: params.status || 'publish', // Default to publish if not specified? Or all? Legacy code suggests all or specific filtering.
                orderby: 'date',
                order: 'desc'
            };

            if (params.category) apiParams.category = params.category;
            if (params.min_price) apiParams.min_price = params.min_price;
            if (params.max_price) apiParams.max_price = params.max_price;
            if (params.sku) apiParams.sku = params.sku;

            // Performance optimization: select specific fields? 
            // Legacy code uses _fields to optimize. We should replicate that if possible, but strict typing might make it tricky unless api supports it well.
            // For now, let's fetch full objects to ensure type safety, or specific fields if we are sure.
            // apiParams._fields = 'id,name,slug,price,regular_price,sale_price,images,stock_status,stock_quantity,categories,type,sku,date_created,status';

            const response = await productsAPI.list(apiParams);

            return {
                data: response.data as Product[],
                total: response.total || 0,
                totalPages: response.totalPages || 0
            };
        } catch (error) {
            secureLog.error('Error fetching products:', error);
            throw error;
        }
    },

    async getProductById(id: number): Promise<Product> {
        try {
            const product = await productsAPI.getById(id);
            return product as Product;
        } catch (error) {
            secureLog.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    async createProduct(data: CreateProductData): Promise<Product> {
        try {
            const product = await productsAPI.create(data);
            return product as Product;
        } catch (error) {
            secureLog.error('Error creating product:', error);
            throw error;
        }
    },

    async updateProduct(id: number, data: Partial<UpdateProductData>): Promise<Product> {
        try {
            const product = await productsAPI.update(id, data);
            return product as Product;
        } catch (error) {
            secureLog.error(`Error updating product ${id}:`, error);
            throw error;
        }
    },

    async deleteProduct(id: number): Promise<boolean> {
        try {
            await productsAPI.delete(id);
            return true;
        } catch (error) {
            secureLog.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    },

    async bulkDeleteProducts(ids: number[]): Promise<boolean> {
        try {
            await productsAPI.bulkDelete(ids);
            return true;
        } catch (error) {
            secureLog.error('Error bulk deleting products:', error);
            throw error;
        }
    },

    // Variations Support
    async getVariations(productId: number): Promise<any[]> {
        try {
            return await productsAPI.getVariations(productId);
        } catch (error) {
            secureLog.error(`Error fetching variations for product ${productId}:`, error);
            throw error;
        }
    },

    async createVariation(productId: number, data: any): Promise<any> {
        try {
            return await productsAPI.createVariation(productId, data);
        } catch (error) {
            secureLog.error(`Error creating variation for product ${productId}:`, error);
            throw error;
        }
    },

    async updateVariation(productId: number, variationId: number, data: any): Promise<any> {
        try {
            return await productsAPI.updateVariation(productId, variationId, data);
        } catch (error) {
            secureLog.error(`Error updating variation ${variationId} for product ${productId}:`, error);
            throw error;
        }
    },

    async deleteVariation(productId: number, variationId: number): Promise<boolean> {
        try {
            await productsAPI.deleteVariation(productId, variationId);
            return true;
        } catch (error) {
            secureLog.error(`Error deleting variation ${variationId} for product ${productId}:`, error);
            throw error;
        }
    }
};
