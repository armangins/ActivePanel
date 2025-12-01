import { MagnifyingGlassIcon as Search } from '@heroicons/react/24/outline';
import Input from './Input';

/**
 * SearchInput Component
 * 
 * Reusable search input component with icon.
 * Uses the new dynamic Input component internally.
 * 
 * @param {string} value - Current search value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} isRTL - Whether layout is right-to-left
 * @param {string} className - Additional CSS classes
 */
const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  isRTL = true,
  className = '' 
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={Search}
      variant="filled"
      containerClassName={className}
      isRTL={isRTL}
    />
  );
};

export default SearchInput;

