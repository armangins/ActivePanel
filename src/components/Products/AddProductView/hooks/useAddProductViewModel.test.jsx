import { renderHook, act } from '@testing-library/react';
import { useAddProductViewModel } from './useAddProductViewModel';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { productsAPI } from '../../../../services/woocommerce';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => key,
        isRTL: false,
        formatCurrency: (val) => `$${val}`
    })
}));

vi.mock('../../../../services/woocommerce', () => ({
    productsAPI: {
        create: vi.fn(),
        update: vi.fn(),
        get: vi.fn()
    },
    variationsAPI: {
        create: vi.fn()
    },
    attributesAPI: {
        getTerms: vi.fn().mockResolvedValue([])
    },
    categoriesAPI: {
        getAll: vi.fn().mockResolvedValue([])
    }
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: null }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useAddProductViewModel with React Hook Form', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAddProductViewModel(), { wrapper });

        expect(result.current.formData.name).toBe('');
        expect(result.current.formData.status).toBe('draft');
        expect(result.current.methods).toBeDefined();
    });

    it('should update fields using methods.setValue', async () => {
        const { result } = renderHook(() => useAddProductViewModel(), { wrapper });

        act(() => {
            result.current.methods.setValue('name', 'New Product');
        });

        // Expect watch() to update formData
        expect(result.current.formData.name).toBe('New Product');
    });

    it('should handle save with valid data', async () => {
        productsAPI.create.mockResolvedValue({ id: 123, name: 'Test Product' });
        const { result } = renderHook(() => useAddProductViewModel(), { wrapper });

        act(() => {
            result.current.methods.setValue('name', 'Test Product');
            result.current.methods.setValue('regular_price', '100');
        });

        await act(async () => {
            await result.current.handleSave('publish');
        });

        expect(productsAPI.create).toHaveBeenCalled();
        expect(productsAPI.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Test Product',
            status: 'publish' // Status override
        }));
    });

    it('should fail validation when publishing without price', async () => {
        const { result } = renderHook(() => useAddProductViewModel(), { wrapper });

        act(() => {
            result.current.methods.setValue('name', 'Test Product');
            // No price
        });

        await act(async () => {
            await result.current.handleSave('publish');
        });

        // Should catch error and set errors
        expect(productsAPI.create).not.toHaveBeenCalled();
        expect(result.current.errors.regular_price).toBeDefined();
    });
});
