import { describe, it, expect } from 'vitest';
import { buildProductData, cleanVariationData } from './productBuilders';

describe('Product Builders', () => {
    describe('buildProductData', () => {
        it('should sanitize text fields', () => {
            const formData = {
                name: 'Product <script>alert(1)</script>',
                description: '<p>Desc</p><script>bad</script>',
                short_description: 'Short <img onerror=alert(1)>',
                sku: 'SKU<script>',
                categories: [],
                images: []
            };

            const result = buildProductData({ formData });

            expect(result.name).toBe('Product');
            expect(result.description).toBe('<p>Desc</p>');
            expect(result.short_description).toBe('Short <img>');
            expect(result.sku).toBe('SKU');
        });

        it('should handle missing fields gracefully', () => {
            const formData = { name: 'Test' };
            const result = buildProductData({ formData });

            expect(result.name).toBe('Test');
            expect(result.description).toBe('');
            expect(result.sku).toBe('');
        });
    });

    describe('cleanVariationData', () => {
        it('should sanitize variation SKU', () => {
            const variationData = {
                regular_price: '100',
                sku: 'VAR-SKU<script>alert(1)</script>',
                attributes: []
            };

            const result = cleanVariationData(variationData);

            expect(result.sku).toBe('VAR-SKU');
        });
    });
});
