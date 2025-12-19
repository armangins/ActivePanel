import { variationsAPI } from '@/services/woocommerce';
import { secureLog } from '@/utils/logger';
import { Variation, VariationFormData } from '../types';

export const variationsService = {
    getVariations: async (productId: number): Promise<Variation[]> => {
        // Implementation placeholder - will likely need to import the actual fetcher
        // For now I'll use a placeholder that will fail build if I don't fix the import, which is good.
        try {
            const response = await variationsAPI.list(productId);
            return response.data;
        } catch (error) {
            secureLog.error('Error fetching variations:', error);
            throw error;
        }
    },

    createVariation: async (productId: number, data: VariationFormData): Promise<Variation> => {
        try {
            return await variationsAPI.create(productId, data);
        } catch (error) {
            secureLog.error('Error creating variation:', error);
            throw error;
        }
    },

    updateVariation: async (productId: number, variationId: number, data: VariationFormData): Promise<Variation> => {
        try {
            return await variationsAPI.update(productId, variationId, data);
        } catch (error) {
            secureLog.error('Error updating variation:', error);
            throw error;
        }
    },

    deleteVariation: async (productId: number, variationId: number): Promise<void> => {
        try {
            await variationsAPI.delete(productId, variationId);
        } catch (error) {
            secureLog.error('Error deleting variation:', error);
            throw error;
        }
    }
};
