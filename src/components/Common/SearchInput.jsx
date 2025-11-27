import { Search } from 'lucide-react';

/**
 * SearchInput Component
 * 
 * A reusable search input field with icon.
 * Supports RTL layout and customizable styling.
 * 
 * @param {String} value - Current search value
 * @param {Function} onChange - Callback when value changes
 * @param {String} placeholder - Placeholder text
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {String} className - Additional CSS classes
 * @param {Object} inputProps - Additional props to pass to the input element
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  isRTL = true,
  className = '',
  ...inputProps
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
        size={20} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all relative"
        style={{
          paddingLeft: '15px',
          paddingRight: '15px',
          textAlign: 'right'
        }}
        dir="rtl"
        {...inputProps}
      />
    </div>
  );
};

export default SearchInput;

