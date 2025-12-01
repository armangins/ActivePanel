import { ArrowPathIcon as Loader } from '@heroicons/react/24/outline';

/**
 * LoadingMoreIndicator Component
 * 
 * Reusable loading indicator for pagination/infinite scroll.
 * 
 * @param {boolean} isRTL - Whether layout is right-to-left
 * @param {string} message - Optional custom loading message
 */
const LoadingMoreIndicator = ({ isRTL = true, message }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center gap-3">
        <Loader className="w-5 h-5 animate-spin text-primary-500" />
        <span className="text-sm text-gray-600">{message || 'Loading...'}</span>
      </div>
    </div>
  );
};

export default LoadingMoreIndicator;

