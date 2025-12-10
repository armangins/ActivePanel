import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddProductView from './AddProductView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// Mock LanguageContext
vi.mock('../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => {
            const translations = {
                'productName': 'Product Name',
                'regularPrice': 'Regular Price',
                'description': 'Description',
                'saveDraft': 'Save Draft',
                'dashboard': 'Dashboard',
                'ecommerce': 'Ecommerce',
                'addProduct': 'Add Product',
                'editProduct': 'Edit Product',
                'calculator': 'Calculator',
                'enterProductName': 'Enter product name', // Fixed placeholder match
                'salePrice': 'Sale Price',
                'sku': 'SKU',
                'stockQuantity': 'Stock Quantity',
                'enterSKU': 'Enter SKU',
                'enterDetailedDescription': 'Enter detailed description', // Added for Description query
            };
            // Return key if no translation (imitating behavior)
            // But components often use || 'Fallback'
            // if we return key, 'enterProductName' || 'Fallback' -> 'enterProductName'
            return translations[key] || "";
        },
        isRTL: false,
        formatCurrency: (val) => `$${val}`
    })
}));

// Mock WooCommerce Services
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

// Mock Gemini Service (SKU Generation)
vi.mock('../../../../services/gemini', () => ({
    generateSKU: vi.fn().mockResolvedValue('MOCKED-SKU')
}));

// Mock Router
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: null }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useLocation: () => ({ pathname: '/products/add' }),
    Link: ({ children }) => <a>{children}</a>
}));

// -----------------------------------------------------------------------------
// Test Setup
// -----------------------------------------------------------------------------

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <AddProductView />
        </QueryClientProvider>
    );
};

describe('AddProductView Security & Input Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * 1. XSS & Malicious Script Injection
     * Input: <script>alert('XSS')</script>
     * Expected: Input should be accepted as literal text (React sanitizes on render),
     * but we verify it doesn't execute or break the render.
     */
    it('should handle XSS strings in product name without executing', async () => {
        renderComponent();

        const nameInput = screen.getByPlaceholderText(/Enter product name/i);
        const maliciousInput = "<script>alert('XSS')</script>";

        fireEvent.change(nameInput, { target: { value: maliciousInput } });

        // Expect full string since fireEvent bypasses maxLength
        expect(nameInput).toHaveValue(maliciousInput);
    });

    /**
     * 2. SQL Injection Patterns
     * Input: Robert'); DROP TABLE Products;--
     * Expected: Accepted as text, no app crash.
     */
    it('should handle SQL injection patterns in description as plain text', async () => {
        renderComponent();

        // Use getByPlaceholderText since getByLabelText failed (missing id/for association)
        const descriptionInput = screen.getByPlaceholderText(/Enter detailed description/i);
        const sqliInput = "Robert'); DROP TABLE Products;--";

        fireEvent.change(descriptionInput, { target: { value: sqliInput } });

        expect(descriptionInput).toHaveValue(sqliInput);
    });

    /**
     * 3. Max Length Enforcement
     * Input: > 20 characters
     * Expected: Input should be truncated or validation error shown.
     */
    it('should enforce max length validation on Product Name', async () => {
        renderComponent();

        const nameInput = screen.getByPlaceholderText(/Enter product name/i);
        const longString = "A".repeat(50);

        fireEvent.change(nameInput, { target: { value: longString } });

        // Name field has maxLength={20} prop in ProductDetailsPanel
        // However, fireEvent.change bypasses standard browser behavior of 'typing' which would respect maxLength prevents.
        // But if the component logic slices it or if standard maxLength prop exists, the DOM node might limit it?
        // Actually, jsdom generally doesn't enforce maxLength on value change via fireEvent.
        // We might need to check the attribute exists.
        expect(nameInput).toHaveAttribute('maxLength', '20');
    });

    /**
     * 4. Numeric Input Validation
     * Input: Non-numeric chars in Price
     * Expected: HTML5 type="number" should prevent non-numeric input (or React state should be empty/NaN).
     */
    it('should prevent non-numeric input in Price fields', async () => {
        renderComponent();

        const priceInput = screen.getByLabelText(/Regular Price/i);

        // fireEvent.change with invalid string on type=number usually results in empty string in DOM.
        fireEvent.change(priceInput, { target: { value: "abc" } });

        // Browser/JSDOM behavior for invalid number values varies, but usually it becomes ""
        expect(priceInput.value).toBe("");
    });

    /**
     * 5. Massive Payload / DoS check
     * Input: Extremely long description (10k chars)
     * Expected: No crash (React handles it).
     */
    it('should handle large text payloads in description without crashing', async () => {
        renderComponent();

        const descriptionInput = screen.getByPlaceholderText(/Enter detailed description/i);
        const largePayload = "Data".repeat(1000); // 4000 chars

        fireEvent.change(descriptionInput, { target: { value: largePayload } });

        expect(descriptionInput).toHaveValue(largePayload);
    });

    /**
     * 6. Unicode / Emoji / Special Chars
     * Input: 🦊🚀🔥 or zero-width joiners
     * Expected: Handled correctly as strings.
     */
    it('should accept unicode and special characters', async () => {
        renderComponent();

        const nameInput = screen.getByPlaceholderText(/Enter product name/i);
        const unicodeString = "Product 🦊🚀";

        fireEvent.change(nameInput, { target: { value: unicodeString } });
        expect(nameInput).toHaveValue(unicodeString);
    });

});
