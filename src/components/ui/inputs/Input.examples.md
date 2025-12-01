# Input Component - Usage Examples

A dynamic, flexible input component that handles multiple use cases throughout the application.

## Basic Usage

```jsx
import { Input } from '../ui/inputs';

// Basic text input
<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
/>
```

## Common Use Cases

### 1. Text Input with Label

```jsx
<Input
  label="Product Name"
  type="text"
  value={productName}
  onChange={(e) => setProductName(e.target.value)}
  placeholder="Enter product name"
  required
/>
```

### 2. Input with Icon

```jsx
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Email input with icon
<Input
  label="Email"
  type="email"
  leftIcon={EnvelopeIcon}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="your@email.com"
/>

// Password input with icon
<Input
  label="Password"
  type="password"
  leftIcon={LockClosedIcon}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### 3. Input with Prefix/Suffix (Currency)

```jsx
// Currency input with prefix
<Input
  label="Price"
  type="text"
  inputMode="decimal"
  prefix="₪"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  placeholder="0.00"
/>

// Percentage with suffix
<Input
  label="Discount"
  type="number"
  suffix="%"
  value={discount}
  onChange={(e) => setDiscount(e.target.value)}
  min={0}
  max={100}
/>
```

### 4. Input with Error State

```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Please enter a valid email address"
  required
/>
```

### 5. Input with Helper Text

```jsx
<Input
  label="SKU"
  type="text"
  value={sku}
  onChange={(e) => setSku(e.target.value)}
  helperText="Stock Keeping Unit - must be unique"
  placeholder="PROD-001"
/>
```

### 6. Different Sizes

```jsx
// Small
<Input
  size="sm"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Medium (default)
<Input
  size="md"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Large
<Input
  size="lg"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 7. Different Variants

```jsx
// Default (outlined)
<Input
  variant="default"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Filled
<Input
  variant="filled"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Outlined (thick border)
<Input
  variant="outlined"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 8. Disabled/ReadOnly States

```jsx
// Disabled
<Input
  label="Read-only Field"
  value="Cannot be edited"
  disabled
/>

// Read-only
<Input
  label="Read-only Field"
  value="Can be selected but not edited"
  readOnly
/>
```

### 9. Number Input

```jsx
<Input
  label="Quantity"
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  min={1}
  max={1000}
  step={1}
  inputMode="numeric"
/>
```

### 10. Input with Validation

```jsx
<Input
  label="Phone Number"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
  placeholder="050-123-4567"
  helperText="Format: 050-123-4567"
/>
```

### 11. Search Input Replacement

```jsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

<Input
  type="text"
  leftIcon={MagnifyingGlassIcon}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search..."
  variant="filled"
/>
```

### 12. Password with Toggle (Built-in)

```jsx
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  helperText="Must be at least 8 characters"
  required
/>
// Password toggle is automatically added!
```

### 13. Input with Icons on Both Sides

```jsx
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

<Input
  label="Username"
  type="text"
  leftIcon={UserIcon}
  rightIcon={isValid ? CheckCircleIcon : ExclamationCircleIcon}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

### 14. Conditional Icon Display

```jsx
<Input
  label="Price"
  type="text"
  prefix="₪"
  showIconOnFocus={true}
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  // Icon only shows when focused or has value
/>
```

### 15. Custom Container Styling

```jsx
<Input
  label="Custom Styled"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  containerClassName="mb-6"
  className="custom-input-class"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | string | 'text' | Input type (text, email, password, number, tel, etc.) |
| value | string | '' | Current input value |
| onChange | function | - | Change handler |
| onBlur | function | - | Blur handler |
| onFocus | function | - | Focus handler |
| label | string | - | Label text |
| placeholder | string | - | Placeholder text |
| error | string | - | Error message to display |
| helperText | string | - | Helper text below input |
| required | boolean | false | Whether field is required |
| disabled | boolean | false | Whether input is disabled |
| readOnly | boolean | false | Whether input is read-only |
| leftIcon | React.Component | - | Icon component on the left (RTL: right) |
| rightIcon | React.Component | - | Icon component on the right (RTL: left) |
| prefix | React.ReactNode | - | Prefix element (e.g., currency symbol) |
| suffix | React.ReactNode | - | Suffix element (e.g., %, unit) |
| size | string | 'md' | Size: 'sm', 'md', 'lg' |
| variant | string | 'default' | Variant: 'default', 'filled', 'outlined' |
| id | string | - | Input ID (auto-generated if not provided) |
| name | string | - | Input name attribute |
| autoComplete | string | - | Autocomplete attribute |
| inputMode | string | - | Input mode for mobile keyboards |
| min | number | - | Minimum value (for number inputs) |
| max | number | - | Maximum value (for number inputs) |
| step | number | - | Step value (for number inputs) |
| maxLength | number | - | Maximum length |
| minLength | number | - | Minimum length |
| pattern | string | - | Pattern for validation |
| className | string | '' | Additional CSS classes |
| containerClassName | string | '' | Additional CSS classes for container |
| showIconOnFocus | boolean | false | Show icon only when focused/has value |
| isRTL | boolean | - | Override RTL (uses context if not provided) |

## Features

- ✅ Full RTL/LTR support
- ✅ Built-in password visibility toggle
- ✅ Automatic padding based on icons/prefixes
- ✅ Validation states (error, helper text)
- ✅ Multiple sizes and variants
- ✅ Icon support (left/right)
- ✅ Prefix/suffix support
- ✅ Accessible (labels, ARIA attributes)
- ✅ Forward ref support
- ✅ All standard HTML input attributes supported




