import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductDetailModal } from '../components/ProductDetails/ProductDetailModal/ProductDetailModal';
// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
        formatCurrency: (amount: any) => `${amount} $`
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// No longer need local MockLanguageProvider wrapper if we mock the module
const MockWrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
);

// Mock window.matchMedia
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

// Verify that we can import the component
describe('ProductDetailModal', () => {
    const mockProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: '100',
        currency: '$',
        stock_status: 'instock',
        images: [{ src: 'test-image.jpg' }],
        categories: [{ id: 1, name: 'Test Category' }],
        description: '<p>Test Description</p>'
    };

    it('renders product details correctly', () => {
        render(
            <MockWrapper>
                <ProductDetailModal
                    product={mockProduct}
                    open={true}
                    onClose={() => { }}
                    onEdit={() => { }}
                />
            </MockWrapper>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('TEST-SKU', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('100 $')).toBeInTheDocument();
        expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <MockWrapper>
                <ProductDetailModal
                    product={mockProduct}
                    open={true}
                    onClose={handleClose}
                    onEdit={() => { }}
                />
            </MockWrapper>
        );

        const closeButton = screen.getByText('close');
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalled();
    });
});
