# Product Upload Testing - Quick Start Guide

## Overview
Automated integration tests for product upload functionality, covering both simple and variable products.

## Test Files Created

1. **`ProductUpload.integration.test.jsx`** - Main test suite
   - Simple product creation
   - Variable product with variations
   - Validation errors
   - API error handling
   - Image upload

2. **`testHelpers.js`** - Reusable test utilities
   - Provider wrappers
   - Mock data
   - Helper functions

## Installation

First, install the required testing dependency:

```bash
npm install --save-dev @testing-library/user-event
```

## Running Tests

### Run all product upload tests:
```bash
npm test ProductUpload.integration.test
```

### Run in watch mode (during development):
```bash
npm test -- --watch ProductUpload.integration.test
```

### Run with coverage:
```bash
npm test -- --coverage ProductUpload.integration.test
```

## Test Coverage

### Simple Product Tests
- ✅ Create product with all required fields
- ✅ Validation errors for missing fields
- ✅ API error handling (duplicate SKU, etc.)
- ✅ Image upload

### Variable Product Tests
- ✅ Create variable product with attributes
- ✅ Create variations with different prices/SKUs
- ✅ Prevent duplicate parent/variation SKUs
- ✅ Multiple variations per product

## Test Structure

```javascript
describe('Product Upload Integration Tests', () => {
  describe('Simple Product Upload', () => {
    it('should successfully create a simple product', async () => {
      // 1. Render component
      // 2. Fill in form fields
      // 3. Click publish
      // 4. Verify API called correctly
      // 5. Verify success modal appears
    });
  });

  describe('Variable Product Upload', () => {
    it('should create variable product with variations', async () => {
      // 1. Fill product details
      // 2. Change type to Variable
      // 3. Select attributes
      // 4. Create variations
      // 5. Publish
      // 6. Verify parent + variations created
    });
  });
});
```

## Mocking Strategy

Tests use **Vitest mocks** instead of MSW for simplicity:

```javascript
vi.mock('../../../../services/woocommerce', () => ({
  productsAPI: {
    create: vi.fn(),
    update: vi.fn(),
  },
  variationsAPI: {
    create: vi.fn(),
  },
  // ... other APIs
}));
```

## Debugging Tests

### View test output:
```bash
npm test -- --reporter=verbose ProductUpload.integration.test
```

### Debug specific test:
```javascript
it.only('should create simple product', async () => {
  // Only this test will run
});
```

### Add debug output:
```javascript
import { screen, debug } from '@testing-library/react';

// Print current DOM
debug();

// Print specific element
debug(screen.getByRole('button'));
```

## Common Issues

### Issue: "Cannot find element"
**Solution:** Use `waitFor` for async operations:
```javascript
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### Issue: "Element not interactable"
**Solution:** Ensure element is visible and not disabled:
```javascript
const button = screen.getByRole('button', { name: /publish/i });
expect(button).not.toBeDisabled();
await user.click(button);
```

### Issue: "Test timeout"
**Solution:** Increase timeout for slow operations:
```javascript
await waitFor(() => {
  expect(mockAPI).toHaveBeenCalled();
}, { timeout: 5000 });
```

## Next Steps

1. Install `@testing-library/user-event`
2. Run tests: `npm test ProductUpload.integration.test`
3. Fix any failing tests
4. Add more edge cases as needed
5. Integrate into CI/CD pipeline

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Product Upload Tests
  run: npm test ProductUpload.integration.test -- --coverage
```

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [User Event Docs](https://testing-library.com/docs/user-event/intro)
