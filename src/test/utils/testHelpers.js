/**
 * Test Utilities for Product Upload Tests
 * Reusable helpers for testing product creation flows
 */

import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import { SettingsProvider } from '../../../contexts/SettingsContext';

/**
 * Creates a test QueryClient with disabled retries
 */
export const createTestQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
};

/**
 * Wrapper component with all required providers
 */
export const AllTheProviders = ({ children, queryClient }) => {
    const testQueryClient = queryClient || createTestQueryClient();

    return (
        <QueryClientProvider client={testQueryClient}>
            <BrowserRouter>
                <LanguageProvider>
                    <AuthProvider>
                        <SettingsProvider>
                            {children}
                        </SettingsProvider>
                    </AuthProvider>
                </LanguageProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

/**
 * Custom render function with all providers
 */
export const renderWithProviders = (ui, options = {}) => {
    const { queryClient, ...renderOptions } = options;

    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders queryClient={queryClient}>
                {children}
            </AllTheProviders>
        ),
        ...renderOptions,
    });
};

/**
 * Mock product data for testing
 */
export const mockProducts = {
    simple: {
        name: 'Test Simple Product',
        regular_price: '99.99',
        sale_price: '79.99',
        sku: 'SIMPLE-001',
        stock_quantity: 50,
        description: 'Test product description',
        short_description: 'Short description',
        categories: [1],
        type: 'simple',
    },
    variable: {
        name: 'Test Variable Product',
        type: 'variable',
        attributes: [
            {
                id: 1,
                name: 'Color',
                variation: true,
                options: ['Red', 'Blue'],
            },
        ],
    },
};

/**
 * Mock variation data
 */
export const mockVariations = {
    red: {
        attributes: [{ id: 1, name: 'Color', option: 'Red' }],
        regular_price: '29.99',
        sku: 'VAR-RED',
        stock_quantity: 10,
    },
    blue: {
        attributes: [{ id: 1, name: 'Color', option: 'Blue' }],
        regular_price: '34.99',
        sku: 'VAR-BLUE',
        stock_quantity: 15,
    },
};

/**
 * Mock categories
 */
export const mockCategories = [
    { id: 1, name: 'Electronics', slug: 'electronics' },
    { id: 2, name: 'Clothing', slug: 'clothing' },
    { id: 3, name: 'Books', slug: 'books' },
];

/**
 * Mock attributes
 */
export const mockAttributes = [
    { id: 1, name: 'Color', slug: 'color' },
    { id: 2, name: 'Size', slug: 'size' },
    { id: 3, name: 'Material', slug: 'material' },
];

/**
 * Mock attribute terms
 */
export const mockAttributeTerms = {
    1: [ // Color
        { id: 10, name: 'Red', slug: 'red' },
        { id: 11, name: 'Blue', slug: 'blue' },
        { id: 12, name: 'Green', slug: 'green' },
    ],
    2: [ // Size
        { id: 20, name: 'Small', slug: 'small' },
        { id: 21, name: 'Medium', slug: 'medium' },
        { id: 22, name: 'Large', slug: 'large' },
    ],
    3: [ // Material
        { id: 30, name: 'Cotton', slug: 'cotton' },
        { id: 31, name: 'Polyester', slug: 'polyester' },
    ],
};

/**
 * Helper to create a mock file for upload testing
 */
export const createMockFile = (name = 'test-image.jpg', type = 'image/jpeg') => {
    const file = new File(['dummy content'], name, { type });
    return file;
};

/**
 * Helper to wait for loading states to complete
 */
export const waitForLoadingToFinish = async (screen) => {
    const { queryByText } = screen;
    // Wait for any loading indicators to disappear
    await waitFor(() => {
        expect(queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
};

/**
 * Helper to fill in basic product form
 */
export const fillBasicProductForm = async (user, data = {}) => {
    const {
        name = 'Test Product',
        price = '99.99',
        sku = 'TEST-SKU',
        stock = '50',
    } = data;

    const nameInput = screen.getByLabelText(/product name/i);
    await user.type(nameInput, name);

    const priceInput = screen.getByLabelText(/regular price/i);
    await user.clear(priceInput);
    await user.type(priceInput, price);

    const skuInput = screen.getByLabelText(/sku/i);
    await user.type(skuInput, sku);

    const stockInput = screen.getByLabelText(/stock quantity/i);
    await user.clear(stockInput);
    await user.type(stockInput, stock);
};

export default {
    renderWithProviders,
    createTestQueryClient,
    AllTheProviders,
    mockProducts,
    mockVariations,
    mockCategories,
    mockAttributes,
    mockAttributeTerms,
    createMockFile,
    waitForLoadingToFinish,
    fillBasicProductForm,
};
