import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../api/auth.service';
import { api } from '../../../services/api';

// Mock the api module
vi.mock('../../../services/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('calls api.post with correct credentials', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            const mockResponse = {
                data: {
                    user: mockUser,
                    accessToken: 'token123'
                }
            };

            (api.post as any).mockResolvedValue(mockResponse);

            const credentials = { email: 'test@example.com', password: 'password' };
            const result = await authService.login(credentials);

            expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
            expect(result).toEqual({ user: mockUser, accessToken: 'token123' });
        });
    });

    describe('register', () => {
        it('calls api.post with correct data', async () => {
            const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
            const mockResponse = {
                data: {
                    user: mockUser,
                    accessToken: 'token123'
                }
            };

            (api.post as any).mockResolvedValue(mockResponse);

            const credentials = {
                email: 'test@example.com',
                password: 'password',
                name: 'Test User',
                confirmPassword: 'password'
            };

            const result = await authService.register(credentials);

            // confirmPassword should be stripped if logic does so, or just passed?
            // Checking auth.service.ts: it passes data as is to api.post('/auth/register', data) usually? 
            // Actually implementation says: return response.data.
            // Let's assume it passes the DTO.
            expect(api.post).toHaveBeenCalledWith('/auth/register', credentials);
            expect(result).toEqual({ user: mockUser, accessToken: 'token123' });
        });
    });

    describe('logout', () => {
        it('calls api.post to logout', async () => {
            (api.post as any).mockResolvedValue({ data: { success: true } });

            await authService.logout();

            expect(api.post).toHaveBeenCalledWith('/auth/logout');
        });
    });
});
