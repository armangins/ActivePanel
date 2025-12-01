# AddProductView Component Structure

This folder contains the refactored `AddProductView` component broken down into smaller, reusable sub-components.

## Component Structure

```
AddProductView/
├── AddProductView.jsx       # Main component
├── index.js                 # Export main component
└── sub-components/          # Sub-components
    ├── index.js            # Export all sub-components
    ├── ProductTypeSelector.jsx
    ├── ProductBasicInfo.jsx
    ├── PriceFields.jsx
    ├── DiscountSelector.jsx
    ├── SkuAndStockFields.jsx
    ├── ShortDescriptionField.jsx
    ├── DescriptionField.jsx
    ├── ScheduleModal.jsx
    └── SuccessModal.jsx
```

## Components Created

### Form Field Components
- **ProductTypeSelector** - Product type selection (simple/variable)
- **ProductBasicInfo** - Product name and category selection
- **PriceFields** - Regular price and sale price with calculator/schedule buttons
- **DiscountSelector** - Discount percentage buttons (5%, 10%, 15%, 20%, 50%)
- **SkuAndStockFields** - SKU input with AI generation and stock quantity
- **ShortDescriptionField** - Short description textarea with AI improvement
- **DescriptionField** - Full description textarea with AI improvement and word count

### Modal Components
- **ScheduleModal** - Modal for scheduling sale start/end dates
- **SuccessModal** - Success message after product creation/update

## Components To Be Extracted

The following sections remain to be extracted:

1. **ImageUploadSection** - Image upload with grid display
2. **AttributesSection** - Attributes selection for variable products
3. **VariationsSection** - Variations display and management
4. **CreateVariationModal** - Modal for creating new variations
5. **EditVariationModal** - Modal for editing existing variations

## Usage

Once refactored, import the main component:

```jsx
import AddProductView from './components/Products/AddProductView';
```

The component will automatically use all sub-components internally.

