import { productsAPI, variationsAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { Product, ProductsResponse, CreateProductData, UpdateProductData } from '../types';

export const productsService = {
    async getProducts(params: any): Promise<ProductsResponse> {
        try {
            return await productsAPI.list(params);
        } catch (error) {
            secureLog.error('Error fetching products:', error);
            throw error;
        }
    },

    async getProductById(id: number): Promise<Product> {
        try {
            return await productsAPI.getById(id);
        } catch (error) {
            secureLog.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    async createProduct(data: CreateProductData): Promise<Product> {
        try {
            return await productsAPI.create(data);
        } catch (error) {
            secureLog.error('Error creating product:', error);
            throw error;
        }
    },

    async updateProduct(id: number, data: Partial<UpdateProductData>): Promise<Product> {
        try {
            return await productsAPI.update(id, data);
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
            const response = await variationsAPI.list(productId);
            // variationsAPI.list returns { data: [], total: number }
            return response.data;
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
