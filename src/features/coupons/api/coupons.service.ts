import { couponsAPI } from '@/services/woocommerce';
import { secureLog } from '@/utils/logger';
import { Coupon } from '../types';

export const couponsService = {
    /**
     * Fetch coupons with pagination and filtering
     */
    getCoupons: async (params: any = {}): Promise<{ data: Coupon[]; total: number; totalPages: number }> => {
        try {
            return await couponsAPI.list(params);
        } catch (error) {
            secureLog.error('Error fetching coupons:', error);
            throw error;
        }
    },

    /**
     * Get a single coupon by ID
     */
    getCoupon: async (id: number): Promise<Coupon> => {
        try {
            return await couponsAPI.getById(id);
        } catch (error) {
            secureLog.error(`Error fetching coupon ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new coupon
     */
    createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
        try {
            return await couponsAPI.create(data);
        } catch (error) {
            secureLog.error('Error creating coupon:', error);
            throw error;
        }
    },

    /**
     * Update a coupon
     */
    updateCoupon: async (id: number, data: Partial<Coupon>): Promise<Coupon> => {
        try {
            return await couponsAPI.update(id, data);
        } catch (error) {
            secureLog.error(`Error updating coupon ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a coupon
     */
    deleteCoupon: async (id: number): Promise<void> => {
        try {
            await couponsAPI.delete(id);
        } catch (error) {
            secureLog.error(`Error deleting coupon ${id}:`, error);
            throw error;
        }
    }
};
