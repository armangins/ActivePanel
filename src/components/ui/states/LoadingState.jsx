import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * LoadingState Component
 * 
 * Reusable loading indicator component.
 * 
 * @param {string} message - Optional custom loading message
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} fullHeight - Whether to take full height
 */
const LoadingState = ({ message, size = 'md', fullHeight = false }) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${fullHeight ? 'h-screen' : 'min-h-screen'}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary-500 mx-auto ${sizeClasses[size]}`}></div>
        <p className="mt-4 text-gray-600 font-regular">{message || t('loading')}</p>
      </div>
    </div>
  );
};

export default LoadingState;

