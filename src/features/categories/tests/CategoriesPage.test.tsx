import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CategoriesPage from '../components/CategoriesPage';
import { useCategoriesData } from '../hooks/useCategoriesData';

// Mock hooks
vi.mock('../hooks/useCategoriesData', () => ({
    useCategoriesData: vi.fn(),
    useDeleteCategory: vi.fn(() => ({ mutate: vi.fn() })),
    useCategoriesList: vi.fn(() => ({ data: [] }))
}));

// Mock Language Context
vi.mock('@/contexts/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, isRTL: false })
}));

describe('CategoriesPage', () => {
    it('renders loading state or empty state initially', () => {
        (useCategoriesData as any).mockReturnValue({
            data: [],
            isLoading: false
        });

        render(<CategoriesPage />);
        // Should show empty state message or button
        expect(screen.getByText('createFirstCategory')).toBeTruthy();
    });

    it('renders categories in table', () => {
        (useCategoriesData as any).mockReturnValue({
            data: [
                { id: 1, name: 'Test Category', slug: 'test-cat', count: 5, parent: 0 }
            ],
            isLoading: false
        });

        render(<CategoriesPage />);
        expect(screen.getByText('Test Category')).toBeTruthy();
    });
});
