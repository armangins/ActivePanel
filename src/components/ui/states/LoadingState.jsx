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
import { LoaderIcon } from '../../icons/LoaderIcon';

const LoadingState = ({ message, size = 'md', fullHeight = false }) => {
  const { t } = useLanguage();

  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <div className={`flex items-center justify-center ${fullHeight ? 'h-screen' : 'min-h-screen'}`}>
      <div className="text-center">
        <div className="flex justify-center mx-auto mb-4">
          <LoaderIcon size={sizeMap[size]} autoplay={true} className="text-primary-500" />
        </div>
        <p className="text-gray-600 font-regular">{message || t('loading')}</p>
      </div>
    </div>
  );
};

export default LoadingState;

