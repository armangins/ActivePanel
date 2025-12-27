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

    /**
     * Search products by search term AND/OR sku
     * This handles the case where general 'search' parameter might effectively filter out SKU matches depending on server config.
     */
    async searchProducts(term: string): Promise<ProductsResponse> {
        try {
            // Run both general search and explicit SKU search in parallel
            const [searchResult, skuResult] = await Promise.all([
                productsAPI.list({ search: term, per_page: 50 }),
                // Only try SKU search if short enough (SKUs rarely > 50 chars) to save resources
                term.length < 50 ? productsAPI.list({ sku: term }) : Promise.resolve({ data: [], total: 0, totalPages: 0 })
            ]);

            // Merge results, removing duplicates
            const allProducts = [...(searchResult.data || [])];
            const existingIds = new Set(allProducts.map(p => p.id));

            if (skuResult.data && skuResult.data.length > 0) {
                skuResult.data.forEach((product: any) => {
                    if (!existingIds.has(product.id)) {
                        allProducts.push(product);
                        existingIds.add(product.id);
                    }
                });
            }

            return {
                data: allProducts,
                total: allProducts.length,
                totalPages: 1 // Artificial pagination for merged results
            };
        } catch (error) {
            secureLog.error('Error searching products:', error);
            throw error;
        }
    },

    /**
     * Fetch all products with minimal fields for client-side indexing.
     * Iterates through all pages to build a complete index.
     * Use with caution on very large catalogs.
     */
    async getAllProductsLight(): Promise<any[]> {
        try {
            const allProducts: any[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await productsAPI.list({
                    page,
                    per_page: 100,
                    _fields: 'id,name,sku,price,regular_price,sale_price,images,stock_status'
                });

                if (response.data && response.data.length > 0) {
                    allProducts.push(...response.data);

                    // Check if we reached the last page
                    if (page >= response.totalPages) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            return allProducts;
        } catch (error) {
            secureLog.error('Error fetching product index:', error);
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
