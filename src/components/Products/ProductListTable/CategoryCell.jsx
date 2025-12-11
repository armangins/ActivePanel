import { sanitizeCategoryName } from '../utils/securityHelpers';

/**
 * CategoryCell Component
 * 
 * Displays the product's category name.
 * Shows the first category if multiple categories exist.
 * 
 * @param {Object} product - Product object
 */
const CategoryCell = ({ product }) => {
  const getCategoryName = () => {
    if (product.categories && product.categories.length > 0) {
      // SECURITY: Sanitize category name to prevent XSS
      return sanitizeCategoryName(product.categories[0].name);
    }
    return '-';
  };

  return (
    <td className="py-3 px-4 text-right">
      <span className="text-sm text-gray-700">{getCategoryName()}</span>
    </td>
  );
};

export default CategoryCell;





