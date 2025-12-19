import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CouponsPage from '../components/CouponsPage';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/contexts/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, isRTL: false })
}));

vi.mock('../../hooks/useCouponsData', () => ({
    useCouponsData: () => ({
        data: {
            data: [
                {
                    id: 1,
                    code: 'TEST20',
                    amount: '20',
                    discount_type: 'percent',
                    usage_count: 5,
                    date_expires: '2025-12-31',
                    description: 'Test Coupon'
                }
            ],
            total: 1,
            totalPages: 1
        },
        isLoading: false
    }),
    useDeleteCoupon: () => ({ mutate: vi.fn() })
}));

vi.mock('../../hooks/useCouponForm', () => ({
    useCouponForm: () => ({
        form: {
            control: {},
            handleSubmit: vi.fn(),
            reset: vi.fn(),
            formState: { errors: {} },
            trigger: vi.fn().mockResolvedValue(true)
        },
        isLoading: false,
        onSubmit: vi.fn(),
        isEditMode: false,
        generateRandomCode: vi.fn()
    })
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false }
    }
});

describe('CouponsPage', () => {
    it('renders the coupons table', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CouponsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('couponsManagement')).toBeTruthy();
        expect(screen.getByText('TEST20')).toBeTruthy();
    });
});
