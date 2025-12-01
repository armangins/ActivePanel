import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Breadcrumbs Component
 * 
 * A flexible breadcrumb navigation component that supports:
 * - Simple text items
 * - Clickable items (buttons/links)
 * - RTL support
 * 
 * @param {Array} items - Array of breadcrumb items. Each item can be:
 *   - String: Simple text label
 *   - Object: { label: string, onClick?: function, href?: string, className?: string }
 * @param {string} separator - Separator between items (default: '/')
 * @param {string} className - Additional CSS classes
 */
const Breadcrumbs = ({ items = [], separator = '/', className = '' }) => {
  const { t } = useLanguage();

  if (!items || items.length === 0) {
    return null;
  }

  const renderItem = (item, index) => {
    const isLast = index === items.length - 1;
    
    // If item is a string, render as simple span
    if (typeof item === 'string') {
      return (
        <span
          key={index}
          className={isLast ? 'text-gray-900 font-medium' : ''}
        >
          {item}
        </span>
      );
    }

    // If item is an object with label
    const { label, onClick, href, className: itemClassName = '' } = item;
    
    if (href) {
      // Render as link
      return (
        <a
          key={index}
          href={href}
          className={`text-gray-600 hover:text-gray-900 ${itemClassName}`}
        >
          {label}
        </a>
      );
    }

    if (onClick) {
      // Render as button
      return (
        <button
          key={index}
          onClick={onClick}
          className={`text-gray-600 hover:text-gray-900 ${itemClassName}`}
        >
          {label}
        </button>
      );
    }

    // Render as span
    return (
      <span
        key={index}
        className={`${isLast ? 'text-gray-900 font-medium' : ''} ${itemClassName}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className={`mb-6 text-sm text-gray-600 ${className}`}>
      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center">
          {renderItem(item, index)}
          {index < items.length - 1 && (
            <span className="mx-2">{separator}</span>
          )}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;



