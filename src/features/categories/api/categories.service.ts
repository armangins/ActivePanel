import { categoriesAPI } from '@/services/woocommerce';
import { Category, CreateCategoryData, UpdateCategoryData } from '../types';
import { secureLog } from '@/utils/logger';

export const categoriesService = {
    getCategories: async (params: any = {}): Promise<Category[]> => {
        try {
            return await categoriesAPI.getAll(params);
        } catch (error) {
            secureLog.error('Error fetching categories:', error);
            throw error;
        }
    },

    createCategory: async (data: CreateCategoryData): Promise<Category> => {
        try {
            return await categoriesAPI.create(data);
        } catch (error) {
            secureLog.error('Error creating category:', error);
            throw error;
        }
    },

    updateCategory: async ({ id, data }: { id: number; data: UpdateCategoryData }): Promise<Category> => {
        try {
            return await categoriesAPI.update(id, data);
        } catch (error) {
            secureLog.error('Error updating category:', error);
            throw error;
        }
    },

    deleteCategory: async (id: number): Promise<void> => {
        try {
            await categoriesAPI.delete(id);
        } catch (error) {
            secureLog.error('Error deleting category:', error);
            throw error;
        }
    },

    bulkDeleteCategories: async (ids: number[]): Promise<void> => {
        try {
            // Assuming woocommerce service has a batch endpoint or we loop. 
            // Implementing loop for safety if batch not exposed clearly yet, 
            // but ideally should use batch endpoint.
            // For now, mapping to individual deletes to ensure functionality.
            await Promise.all(ids.map(id => categoriesAPI.delete(id)));
        } catch (error) {
            secureLog.error('Error bulk deleting categories:', error);
            throw error;
        }
    }
};
