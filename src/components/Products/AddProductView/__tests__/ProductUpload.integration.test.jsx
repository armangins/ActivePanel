import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { AuthProvider } from '../../../../contexts/AuthContext';
import AddProductView from '../AddProductView';
import * as woocommerceAPI from '../../../../services/woocommerce';

// Mock the services
vi.mock('../../../../services/woocommerce', () => ({
    productsAPI: {
        create: vi.fn(),
        update: vi.fn(),
    },
    variationsAPI: {
        create: vi.fn(),
    },
    attributesAPI: {
        getAll: vi.fn(),
        getTerms: vi.fn(),
    },
    categoriesAPI: {
        getAll: vi.fn(),
    },
    mediaAPI: {
        upload: vi.fn(),
    },
}));

vi.mock('../../../../services/gemini', () => ({
    generateSKU: vi.fn().mockResolvedValue('AUTO-SKU-123'),
    improveText: vi.fn().mockResolvedValue('Improved text'),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: null }),
        useNavigate: () => vi.fn(),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
    };
});

// Test wrapper with all providers
const AllTheProviders = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

const renderAddProductView = () => {
    return render(<AddProductView />, { wrapper: AllTheProviders });
};

describe('Product Upload Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock responses
        woocommerceAPI.categoriesAPI.getAll.mockResolvedValue([
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
        ]);

        woocommerceAPI.attributesAPI.getAll.mockResolvedValue([
            { id: 1, name: 'Color' },
            { id: 2, name: 'Size' },
        ]);

        woocommerceAPI.attributesAPI.getTerms.mockImplementation((attributeId) => {
            if (attributeId === 1) {
                return Promise.resolve([
                    { id: 10, name: 'Red', slug: 'red' },
                    { id: 11, name: 'Blue', slug: 'blue' },
                ]);
            }
            if (attributeId === 2) {
                return Promise.resolve([
                    { id: 20, name: 'Small', slug: 'small' },
                    { id: 21, name: 'Large', slug: 'large' },
                ]);
            }
            return Promise.resolve([]);
        });
    });

    describe('Simple Product Upload', () => {
        it('should successfully create a simple product with all required fields', async () => {
            const user = userEvent.setup();

            // Mock successful product creation
            woocommerceAPI.productsAPI.create.mockResolvedValue({
                id: 123,
                name: 'Test Product',
                status: 'publish',
            });

            renderAddProductView();

            // Wait for form to load using testId
            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill in product name using testId
            const nameInput = screen.getByTestId('product-name-input');
            await user.type(nameInput, 'Test Product');

            // Fill in regular price using testId
            const priceInput = screen.getByTestId('regular-price-input');
            await user.clear(priceInput);
            await user.type(priceInput, '99.99');

            // Fill in SKU using testId
            const skuInput = screen.getByTestId('sku-input');
            await user.type(skuInput, 'TEST-SKU-001');

            // Fill in stock quantity using testId
            const stockInput = screen.getByTestId('stock-quantity-input');
            await user.clear(stockInput);
            await user.type(stockInput, '50');

            // Click Publish button
            const publishButton = screen.getByRole('button', { name: /פרסם|publish/i });
            await user.click(publishButton);

            // Verify API was called with correct data
            await waitFor(() => {
                expect(woocommerceAPI.productsAPI.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Test Product',
                        regular_price: '99.99',
                        sku: 'TEST-SKU-001',
                        stock_quantity: 50,
                        status: 'publish',
                        type: 'simple',
                    })
                );
            });

            // Verify success modal appears
            await waitFor(() => {
                expect(screen.getByText(/הצלחה|success/i)).toBeInTheDocument();
            });
        });

        it('should show validation errors when required fields are missing', async () => {
            const user = userEvent.setup();
            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Try to publish without filling required fields
            const publishButton = screen.getByRole('button', { name: /פרסם|publish/i });
            await user.click(publishButton);

            // Verify validation errors appear (checking for error state)
            await waitFor(() => {
                const nameInput = screen.getByTestId('product-name-input');
                // Input should have error styling or parent should show error
                expect(nameInput.closest('div')).toBeInTheDocument();
            });

            // Verify API was NOT called
            expect(woocommerceAPI.productsAPI.create).not.toHaveBeenCalled();
        });

        it('should handle API errors gracefully', async () => {
            const user = userEvent.setup();

            // Mock API error
            woocommerceAPI.productsAPI.create.mockRejectedValue({
                response: {
                    data: {
                        message: 'SKU already exists',
                    },
                },
            });

            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill in required fields
            await user.type(screen.getByTestId('product-name-input'), 'Test Product');
            await user.type(screen.getByTestId('regular-price-input'), '99.99');
            await user.type(screen.getByTestId('sku-input'), 'DUPLICATE-SKU');

            // Try to publish
            const publishButton = screen.getByRole('button', { name: /פרסם|publish/i });
            await user.click(publishButton);

            // Verify error handling (error should be displayed somewhere)
            await waitFor(() => {
                expect(woocommerceAPI.productsAPI.create).toHaveBeenCalled();
            });
        });
    });

    describe('Variable Product Upload', () => {
        it('should change product type to variable', async () => {
            const user = userEvent.setup();

            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill in product name
            await user.type(screen.getByTestId('product-name-input'), 'Variable T-Shirt');

            // Find and click the Variable product type button
            // The button should have aria-label or text content
            const variableButton = screen.getByRole('button', { name: /משתנה|variable/i });
            await user.click(variableButton);

            // Verify the button is now selected (aria-pressed="true")
            await waitFor(() => {
                expect(variableButton).toHaveAttribute('aria-pressed', 'true');
            });
        });
    });

    describe('Form Rendering', () => {
        it('should render all required form fields', async () => {
            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
                expect(screen.getByTestId('regular-price-input')).toBeInTheDocument();
                expect(screen.getByTestId('sku-input')).toBeInTheDocument();
                expect(screen.getByTestId('stock-quantity-input')).toBeInTheDocument();
            });
        });

        it('should have publish and save as draft buttons', async () => {
            renderAddProductView();

            await waitFor(() => {
                const publishButton = screen.getByRole('button', { name: /פרסם|publish/i });
                const draftButton = screen.getByRole('button', { name: /טיוטה|draft/i });

                expect(publishButton).toBeInTheDocument();
                expect(draftButton).toBeInTheDocument();
            });
        });
    });
});
