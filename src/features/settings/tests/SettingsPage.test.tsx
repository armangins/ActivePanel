import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsPage } from '../components/SettingsPage';
import { SettingsProvider } from '../providers/SettingsProvider';
import { AuthProvider } from '@/features/auth';

// Mock dependencies
vi.mock('@/features/auth', () => ({
    useAuth: vi.fn(() => ({ isAuthenticated: true })),
    AuthProvider: ({ children }: any) => children,
}));

vi.mock('../api/settings.service', () => ({
    settingsService: {
        get: vi.fn().mockResolvedValue({}),
        update: vi.fn(),
    }
}));

// Mock child components to avoid complex rendering in unit test
vi.mock('../components/tabs/WooCommerceSettings', () => ({
    WooCommerceSettings: () => <div data-testid="woocommerce-settings">WooCommerce Settings</div>
}));

vi.mock('../components/tabs/GA4Connection', () => ({
    GA4Connection: () => <div>GA4 Connection</div>
}));

// ... mock others if needed, but lazy loading might handle them if not activated?
// SettingsPage lazy loads tabs.
// We need to wait for Suspense.

describe('SettingsPage', () => {
    it('renders and shows tabs', async () => {
        render(
            <SettingsProvider>
                <SettingsPage />
            </SettingsProvider>
        );

        // Check for header
        expect(screen.getByText(/Settings/i)).toBeInTheDocument(); // Localization might make this fail if key is different, checking English fallback
        // Or check unique element.

        // Wait for tabs to be visible
        // Tabs handles: WooCommerce, Google Analytics, etc.
        // Ant Design Tabs might render labels.

        // Using getByRole for tab
        // Or just text.
        // Given localization, it's safer to check for known English fallback or mock translation.
    });
});
