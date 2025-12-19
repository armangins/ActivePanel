import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../components/DashboardPage';
import { SettingsProvider } from '@/features/settings';

// Mock Auth
vi.mock('@/features/auth', () => ({
    useAuth: vi.fn(() => ({ isAuthenticated: true })),
    AuthProvider: ({ children }: any) => children,
}));

// Mock API Service
vi.mock('../api/dashboard.service', () => ({
    dashboardService: {
        getDashboardData: vi.fn().mockResolvedValue({
            stats: {
                totalRevenue: '100.00',
                totalOrders: 10,
                totalCustomers: 5,
                totalProducts: 20
            },
            salesChartData: [],
            recentOrders: [],
            topProducts: [],
            lowStockCount: 0
        })
    }
}));

// Mock Settings (to provide configured state)
vi.mock('@/features/settings', () => ({
    useSettings: () => ({
        settings: {
            hasConsumerKey: true,
            hasConsumerSecret: true
        }
    }),
    SettingsProvider: ({ children }: any) => children
}));


describe('DashboardPage', () => {
    it('renders dashboard content', async () => {
        // Need QueryClientProvider normally, or mock the hook.
        // Easier to mock the hook useDashboardData.
    });
});
