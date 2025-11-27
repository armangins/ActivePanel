import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

/**
 * ProductListHeader Component
 * 
 * Table header row with column titles and select all checkbox.
 * 
 * @param {Array} products - Array of all products
 * @param {Array} selectedProducts - Array of selected product IDs
 * @param {Function} onSelectAll - Callback when select all checkbox is toggled
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {String} sortField - Current sort field ('name' or 'price')
 * @param {String} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is triggered
 */
const ProductListHeader = ({ products, selectedProducts, onSelectAll, isRTL, t, sortField, sortDirection, onSort }) => {
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={16} className="text-primary-500" />
      : <ChevronDown size={16} className="text-primary-500" />;
  };
  const isAllSelected = selectedProducts.length === products.length && products.length > 0;

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {/* Checkbox Column */}
        <th className={`py-3 px-4 w-12 ${'text-right'}`}>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            aria-label={t('selectAll') || 'Select all products'}
          />
        </th>

        {/* Products Column */}
        <th className="py-3 px-4 text-sm font-medium text-gray-700 text-right">
          <button
            onClick={() => onSort && onSort('name')}
            className={`flex items-center justify-end gap-2 flex-row-reverse w-full hover:text-primary-500 transition-colors cursor-pointer ${
              sortField === 'name' ? 'text-primary-500' : ''
            }`}
          >
            {t('products')}
            {getSortIcon('name')}
          </button>
        </th>

        {/* Category Column */}
        <th className="py-3 px-4 text-sm font-medium text-gray-700 text-right">
          <div className="flex items-center justify-end gap-2 flex-row-reverse">
            {t('category')}
          </div>
        </th>

        {/* Price Column */}
        <th className="py-3 px-4 text-sm font-medium text-gray-700 text-right">
          <button
            onClick={() => onSort && onSort('price')}
            className={`flex items-center justify-end gap-2 flex-row-reverse w-full hover:text-primary-500 transition-colors cursor-pointer ${
              sortField === 'price' ? 'text-primary-500' : ''
            }`}
          >
            {t('price')}
            {getSortIcon('price')}
          </button>
        </th>

        {/* Sale Price Column */}
        <th className="py-3 px-4 text-sm font-medium text-gray-700 text-right">
          <div className="flex items-center justify-end gap-2 flex-row-reverse">
            {t('salePrice') || 'Sale Price'}
          </div>
        </th>

        {/* Stock Status Column */}
        <th className="py-3 px-4 text-sm font-medium text-gray-700 text-right">
          {t('stockStatus')}
        </th>

        {/* Actions Column */}
        <th className="py-3 px-4 w-16 text-sm font-medium text-gray-700 text-center">
          <span className="sr-only">{t('actions')}</span>
        </th>
      </tr>
    </thead>
  );
};

export default ProductListHeader;

