import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductsPage } from '../components/ProductsPage';
import { TestWrapper } from '@/test/utils/TestWrapper';
import { productsService } from '../api/products.service';

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

// Mock the service
vi.mock('../api/products.service', () => ({
    productsService: {
        getProducts: vi.fn(),
        deleteProduct: vi.fn()
    }
}));

// Mock legacy helpers that might cause issues
vi.mock('@/utils/loginHelpers', () => ({
    authenticateWithEmail: vi.fn()
}));

// Mock settings to ensure page renders
vi.mock('@/features/settings', () => ({
    useSettings: vi.fn().mockReturnValue({
        settings: { hasConsumerKey: true, hasConsumerSecret: true },
        isLoading: false
    }),
    SettingsProvider: ({ children }: any) => <>{children}</>
}));

describe('ProductsPage', () => {
    it('renders products list', async () => {
        // Mock data
        (productsService.getProducts as any).mockResolvedValue({
            data: [
                { id: 1, name: 'Test Product 1', price: '10.00', stock_status: 'instock', type: 'simple' },
                { id: 2, name: 'Test Product 2', price: '20.00', stock_status: 'outofstock', type: 'variable' }
            ],
            total: 2,
            totalPages: 1
        });

        render(
            <TestWrapper>
                <ProductsPage />
            </TestWrapper>
        );

        // Verify initial load
        // Use getByRole to be locale-agnostic or check for presence
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeDefined();

        // Wait for data to load and loading state to disappear
        await waitFor(() => {
            expect(screen.getByText('Test Product 1')).toBeDefined();
            expect(screen.getByText('Test Product 2')).toBeDefined();
        });
    });
});
