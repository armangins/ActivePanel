import { describe, it, expect } from 'vitest';
import { settingsSchema } from './settings';
import { categorySchema } from './category';
import { couponSchema } from './coupon';

describe('Phase 3 Schemas', () => {
    describe('settingsSchema', () => {
        it('should require storeUrl', () => {
            const result = settingsSchema.safeParse({
                consumerKey: 'ck_123',
                consumerSecret: 'cs_123'
            });
            expect(result.success).toBe(false);
        });
        it('should validate valid settings', () => {
            const result = settingsSchema.safeParse({
                storeUrl: 'https://example.com',
                consumerKey: 'ck_123',
                consumerSecret: 'cs_123'
            });
            expect(result.success).toBe(true);
        });
        it('should validate url format', () => {
            const result = settingsSchema.safeParse({
                storeUrl: 'invalid-url',
                consumerKey: 'ck_123',
                consumerSecret: 'cs_123'
            });
            expect(result.success).toBe(false);
        });
    });

    describe('categorySchema', () => {
        it('should validate valid category', () => {
            const result = categorySchema.safeParse({
                name: 'New Category'
            });
            expect(result.success).toBe(true);
        });
        it('should fail without name', () => {
            const result = categorySchema.safeParse({
                slug: 'slug'
            });
            expect(result.success).toBe(false);
        });
    });

    describe('couponSchema', () => {
        it('should validate valid coupon', () => {
            const result = couponSchema.safeParse({
                code: 'SAVE10',
                amount: '10'
            });
            expect(result.success).toBe(true);
        });
        it('should fail without code', () => {
            const result = couponSchema.safeParse({
                amount: '10'
            });
            expect(result.success).toBe(false);
        });
    });
});
