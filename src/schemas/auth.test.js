import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth';

describe('Auth Schemas', () => {
    describe('loginSchema', () => {
        it('should validate valid inputs', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid email', () => {
            const result = loginSchema.safeParse({
                email: 'invalid-email',
                password: 'password123'
            });

            if (result.success) {
                console.log('Unexpected success:', result.data);
                throw new Error('Validation should have failed for invalid email');
            }
            console.log('Result Error:', JSON.stringify(result, null, 2));
            if (result.error) {
                console.log('Error properties:', Object.keys(result.error));
                console.log('Errors array:', result.error.issues);
            }

            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain('אימייל');
        });

        it('should reject empty password', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: ''
            });
            expect(result.success).toBe(false);
        });
    });

    describe('registerSchema', () => {
        it('should validate valid registration', () => {
            const result = registerSchema.safeParse({
                email: 'new@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                name: 'John Doe'
            });
            expect(result.success).toBe(true);
        });

        it('should reject short password', () => {
            const result = registerSchema.safeParse({
                email: 'new@example.com',
                password: '123',
                confirmPassword: '123',
                name: 'John Doe'
            });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain('6 תווים');
        });

        it('should reject mismatching passwords', () => {
            const result = registerSchema.safeParse({
                email: 'new@example.com',
                password: 'password123',
                confirmPassword: 'password456',
                name: 'John Doe'
            });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain('אינן תואמות');
        });
    });
});
