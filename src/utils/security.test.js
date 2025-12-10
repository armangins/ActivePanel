import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './security';

describe('Security Utils', () => {
    describe('sanitizeInput', () => {
        it('should return non-string inputs as is', () => {
            expect(sanitizeInput(null)).toBe(null);
            expect(sanitizeInput(undefined)).toBe(undefined);
            expect(sanitizeInput(123)).toBe(123);
        });

        it('should strip script tags', () => {
            const input = 'Hello <script>alert("xss")</script> World';
            expect(sanitizeInput(input)).toBe('Hello  World');
        });

        it('should strip event handlers', () => {
            const input = '<img src="x" onerror="alert(1)">';
            expect(sanitizeInput(input)).toBe('<img src="x">');
        });

        it('should preserve safe HTML', () => {
            const input = '<b>Bold</b> and <i>Italic</i>';
            expect(sanitizeInput(input)).toBe('<b>Bold</b> and <i>Italic</i>');
        });

        it('should trim whitespace', () => {
            const input = '  test  ';
            expect(sanitizeInput(input)).toBe('test');
        });
    });
});
