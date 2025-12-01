import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DashboardSidebar Component
 * 
 * Generic sidebar that can display different types of data
 * 
 * @param {boolean} isOpen - Whether the sidebar is open
 * @param {Function} onClose - Callback to close the sidebar
 * @param {string} title - Sidebar title
 * @param {string} subtitle - Sidebar subtitle (optional)
 * @param {React.Component} icon - Icon component
 * @param {Array} items - Array of items to display
 * @param {Function} renderItem - Function to render each item
 * @param {Function} formatCurrency - Function to format currency values
 * @param {React.ReactNode} emptyState - Empty state component (optional)
 */
const DashboardSidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon: Icon,
  items = [], 
  renderItem,
  formatCurrency,
  emptyState
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[100] transition-all duration-300 ease-in-out ${
          isOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-96 bg-white shadow-2xl z-[101] transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto' 
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary-50 rounded-lg">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('close') || 'סגור'}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {items.length === 0 ? (
            emptyState || (
              <div className="flex flex-col items-center justify-center h-full p-8 text-right">
                <p className="text-gray-500 text-lg">
                  {t('noData') || 'אין נתונים להצגה'}
                </p>
              </div>
            )
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item, index) => (
                <div key={item.id || index}>
                  {renderItem ? renderItem(item, formatCurrency) : (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;

