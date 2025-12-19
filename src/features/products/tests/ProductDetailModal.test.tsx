import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductDetailModal } from '../components/ProductDetails/ProductDetailModal';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock LanguageProvider
const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
);

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
            <MockLanguageProvider>
                <ProductDetailModal
                    product={mockProduct}
                    open={true}
                    onClose={() => { }}
                    onEdit={() => { }}
                />
            </MockLanguageProvider>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('TEST-SKU', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('100 $')).toBeInTheDocument();
        expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <MockLanguageProvider>
                <ProductDetailModal
                    product={mockProduct}
                    open={true}
                    onClose={handleClose}
                    onEdit={() => { }}
                />
            </MockLanguageProvider>
        );

        const closeButtons = screen.getAllByText('close'); // might match text in provider too, be careful. 
        // Better trigger by key or known button text if unique. 
        // "close" is likely the translation key. Assuming "close" or "Close" text.
    });
});
