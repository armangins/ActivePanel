import { describe, it, expect } from 'vitest';
import { productSchema, variationSchema } from './product';

describe('Product Schemas', () => {
    describe('productSchema', () => {
        it('should validate valid simple product', () => {
            const result = productSchema.safeParse({
                name: 'Test Product',
                regular_price: '100',
                manage_stock: true,
                stock_quantity: 10
            });
            if (!result.success) {
                console.log(result.error);
            }
            expect(result.success).toBe(true);
        });

        it('should require name', () => {
            const result = productSchema.safeParse({
                regular_price: '100'
            });
            expect(result.success).toBe(false);
            // expect(result.error.issues[0].message).toContain('נא להזין');
        });

        it('should allow empty price for draft', () => {
            const result = productSchema.safeParse({
                name: 'Draft Product',
                status: 'draft'
            });
            expect(result.success).toBe(true);
        });

        it('should require price for published product', () => {
            const result = productSchema.safeParse({
                name: 'Live Product',
                status: 'publish'
            });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].path[0]).toBe('regular_price');
        });
        it('should require stock quantity if managed', () => {
            const result = productSchema.safeParse({
                name: 'Stock Product',
                regular_price: '100',
                manage_stock: true,
                status: 'publish'
            });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].path[0]).toBe('stock_quantity');
        });

        it('should allow empty stock if not managed', () => {
            const result = productSchema.safeParse({
                name: 'No Stock Product',
                regular_price: '100',
                manage_stock: false,
                status: 'publish'
            });
            expect(result.success).toBe(true);
        });
    });
});

describe('variationSchema', () => {
    it('should validate valid variation', () => {
        const result = variationSchema.safeParse({
            regular_price: '50',
            attributes: [{ id: 1, option: 'Blue' }]
        });
        expect(result.success).toBe(true);
    });
});

