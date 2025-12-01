import { ChevronUpIcon as ChevronUp, ChevronDownIcon as ChevronDown, ArrowsUpDownIcon as ArrowUpDown } from '@heroicons/react/24/outline';

/**
 * ProductListHeader Component
 * 
 * Table header row with column titles.
 * 
 * @param {Array} products - Array of all products
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {String} sortField - Current sort field ('name' or 'price')
 * @param {String} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is triggered
 */
const ProductListHeader = ({ products, isRTL, t, sortField, sortDirection, onSort }) => {
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary-500" />
      : <ChevronDown className="w-4 h-4 text-primary-500" />;
  };

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
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

