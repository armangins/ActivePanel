import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from '../components/LoginForm';
import { authService } from '../api/auth.service';
import { useAuth } from '../providers/AuthProvider';

// Mock authService
vi.mock('../api/auth.service', () => ({
    authService: {
        login: vi.fn(),
    },
}));

// Mock useAuth
vi.mock('../providers/AuthProvider', () => ({
    useAuth: vi.fn(),
}));

// Mock ResizeObserver for Ant Design
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('LoginForm', () => {
    const mockLogin = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            login: mockLogin,
        });
    });

    it('renders login form correctly', () => {
        render(<LoginForm onSuccess={mockOnSuccess} />);

        expect(screen.getByLabelText(/מייל/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/סיסמא/i)).toBeInTheDocument(); // Need to check exact label text
        expect(screen.getByRole('button', { name: /התחברות/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<LoginForm onSuccess={mockOnSuccess} />);

        fireEvent.click(screen.getByRole('button', { name: /התחברות/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid email/i)).toBeInTheDocument(); // Zod default error for empty email? Or custom?
            // Actually my schema might produce "Invalid email" or "Required". 
            // Let's check schemas.ts. Zod default for email is "Invalid email".
        });
    });

    it('calls login on valid submission', async () => {
        (authService.login as any).mockResolvedValue({
            user: { id: '1', email: 'test@test.com' },
            accessToken: 'fake-token'
        });

        render(<LoginForm onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/מייל/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/סיסמא/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /התחברות/i }));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@test.com',
                password: 'password123'
            }));
            expect(mockLogin).toHaveBeenCalled();
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('displays error on failed login', async () => {
        (authService.login as any).mockRejectedValue(new Error('Login failed'));

        render(<LoginForm onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/מייל/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/סיסמא/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /התחברות/i }));

        await waitFor(() => {
            expect(screen.getByText('Login failed')).toBeInTheDocument();
        });
    });
});
