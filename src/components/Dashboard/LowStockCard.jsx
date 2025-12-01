import { ExclamationTriangleIcon as AlertTriangle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * LowStockCard Component
 * 
 * Displays products with low stock or out of stock
 * Similar to StatCard but shows low stock products count
 * 
 * @param {number} count - Number of products with low/out of stock
 * @param {string} change - Optional change percentage
 * @param {string} trend - Trend direction: 'up' or 'down'
 */
const LowStockCard = ({ count, change, trend }) => {
  const { t } = useLanguage();
  const isPositive = trend === 'up';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center flex-row-reverse justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1 text-right">
            {t('lowStockProducts') || 'מוצרים במלאי נמוך'}
          </p>
          <p className="text-2xl font-bold text-gray-900 text-right">{count}</p>
          {change && (
            <div className={`flex items-center flex-row-reverse mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-orange-600'}`}>
              {isPositive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className="mr-1">{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-orange-50 rounded-lg flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default LowStockCard;




