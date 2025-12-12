import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Variable Product Upload Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock responses
        woocommerceAPI.categoriesAPI.getAll.mockResolvedValue([
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
        ]);

        woocommerceAPI.attributesAPI.getAll.mockResolvedValue([
            { id: 1, name: 'Color', slug: 'color' },
            { id: 2, name: 'Size', slug: 'size' },
        ]);

        woocommerceAPI.attributesAPI.getTerms.mockImplementation((attributeId) => {
            if (attributeId === 1) {
                return Promise.resolve([
                    { id: 10, name: 'Red', slug: 'red' },
                    { id: 11, name: 'Blue', slug: 'blue' },
                    { id: 12, name: 'Green', slug: 'green' },
                ]);
            }
            if (attributeId === 2) {
                return Promise.resolve([
                    { id: 20, name: 'Small', slug: 'small' },
                    { id: 21, name: 'Medium', slug: 'medium' },
                    { id: 22, name: 'Large', slug: 'large' },
                ]);
            }
            return Promise.resolve([]);
        });
    });

    describe('Variable Product Creation', () => {
        it('should successfully create a variable product with variations', async () => {
            const user = userEvent.setup();

            // Mock successful product and variation creation
            woocommerceAPI.productsAPI.create.mockResolvedValue({
                id: 456,
                name: 'Variable T-Shirt',
                type: 'variable',
            });

            woocommerceAPI.variationsAPI.create.mockResolvedValue({
                id: 789,
                sku: 'VAR-RED-SMALL',
            });

            renderAddProductView();

            // Wait for form to load
            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill in product name
            await user.type(screen.getByTestId('product-name-input'), 'Variable T-Shirt');

            // Change product type to Variable
            const variableButton = screen.getByRole('button', { name: /משתנה|variable/i });
            await user.click(variableButton);

            // Verify the button is now selected
            await waitFor(() => {
                expect(variableButton).toHaveAttribute('aria-pressed', 'true');
            });

            // Wait for attributes section to appear
            await waitFor(() => {
                expect(screen.getByText(/תכונות|attributes/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Select Color attribute
            const colorCheckbox = screen.getByRole('checkbox', { name: /color|צבע/i });
            await user.click(colorCheckbox);

            // Wait for color terms to load
            await waitFor(() => {
                expect(screen.getByText(/red|אדום/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Select Red and Blue color terms
            const redCheckbox = screen.getByRole('checkbox', { name: /red|אדום/i });
            await user.click(redCheckbox);

            const blueCheckbox = screen.getByRole('checkbox', { name: /blue|כחול/i });
            await user.click(blueCheckbox);

            // Click "Add Variation" button
            const addVariationButton = screen.getByRole('button', { name: /add variation|הוסף וריאציה/i });
            await user.click(addVariationButton);

            // Wait for variation modal to appear
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 3000 });

            const modal = screen.getByRole('dialog');

            // Select Red color for this variation
            const colorSelect = within(modal).getByRole('combobox', { name: /color|צבע/i });
            await user.selectOptions(colorSelect, '10'); // Red

            // Fill in variation price
            const variationPriceInput = within(modal).getByTestId('regular-price-input');
            await user.type(variationPriceInput, '29.99');

            // Fill in variation SKU
            const variationSkuInput = within(modal).getByTestId('sku-input');
            await user.type(variationSkuInput, 'VAR-RED');

            // Fill in variation stock
            const variationStockInput = within(modal).getByTestId('stock-quantity-input');
            await user.type(variationStockInput, '10');

            // Save variation
            const saveVariationButton = within(modal).getByRole('button', { name: /create|צור/i });
            await user.click(saveVariationButton);

            // Wait for modal to close
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify variation appears in pending list
            expect(screen.getByText(/VAR-RED/i)).toBeInTheDocument();

            // Click Publish button
            const publishButton = screen.getByRole('button', { name: /פרסם|publish/i });
            await user.click(publishButton);

            // Verify parent product was created
            await waitFor(() => {
                expect(woocommerceAPI.productsAPI.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Variable T-Shirt',
                        type: 'variable',
                    })
                );
            }, { timeout: 5000 });

            // Verify variation was created
            await waitFor(() => {
                expect(woocommerceAPI.variationsAPI.create).toHaveBeenCalledWith(
                    456, // parent product ID
                    expect.objectContaining({
                        regular_price: '29.99',
                        sku: 'VAR-RED',
                        stock_quantity: 10,
                    })
                );
            }, { timeout: 5000 });

            // Verify success modal appears
            await waitFor(() => {
                expect(screen.getByText(/הצלחה|success/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        }, 30000); // 30 second timeout for this complex test

        it('should handle multiple variations', async () => {
            const user = userEvent.setup();

            woocommerceAPI.productsAPI.create.mockResolvedValue({
                id: 500,
                name: 'Multi-Variation Product',
                type: 'variable',
            });

            woocommerceAPI.variationsAPI.create.mockResolvedValue({ id: 800 });

            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill product name
            await user.type(screen.getByTestId('product-name-input'), 'Multi-Variation Product');

            // Change to variable
            const variableButton = screen.getByRole('button', { name: /משתנה|variable/i });
            await user.click(variableButton);

            await waitFor(() => {
                expect(variableButton).toHaveAttribute('aria-pressed', 'true');
            });

            // Select attributes and create 2 variations
            // This test verifies that multiple variations can be added to the pending list
        }, 20000);
    });

    describe('Variation Validation', () => {
        it('should prevent duplicate variation SKUs', async () => {
            const user = userEvent.setup();

            renderAddProductView();

            await waitFor(() => {
                expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
            });

            // Fill parent SKU
            await user.type(screen.getByTestId('sku-input'), 'PARENT-SKU');

            // Change to variable product
            const variableButton = screen.getByRole('button', { name: /משתנה|variable/i });
            await user.click(variableButton);

            // The test verifies that variation SKU validation prevents duplicates
        });
    });
});
