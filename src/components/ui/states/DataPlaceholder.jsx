import { ArrowPathIcon, CloudArrowUpIcon as Cloud } from '@heroicons/react/24/outline';

/**
 * DataPlaceholder Component
 * 
 * A beautiful placeholder component to show when data is loading or on its way
 * Use this when there's a connection issue or data is being fetched
 */
const DataPlaceholder = ({ 
  message, 
  subMessage,
  icon: Icon = Cloud,
  showSpinner = false 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" dir="rtl">
      <div className="relative mb-4">
        {showSpinner ? (
          <ArrowPathIcon className="w-12 h-12 text-primary-500 animate-spin" />
        ) : (
          <div className="relative">
            <Icon className="w-16 h-16 text-gray-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {message || 'הנתונים בדרך'}
      </h3>
      
      {subMessage && (
        <p className="text-sm text-gray-500 max-w-md">
          {subMessage}
        </p>
      )}
      
      <div className="mt-6 flex gap-2">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default DataPlaceholder;

