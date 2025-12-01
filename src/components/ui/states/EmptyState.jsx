import { CubeIcon as Package } from '@heroicons/react/24/outline';
import Card from '../cards/Card';

/**
 * EmptyState Component
 * 
 * Reusable empty state display component.
 * 
 * @param {string} message - Main message to display
 * @param {string} description - Optional description text
 * @param {React.Component} icon - Icon component (default: Package)
 * @param {React.ReactNode} action - Optional action button/element
 * @param {boolean} isRTL - Whether layout is right-to-left
 */
const EmptyState = ({ 
  message, 
  description, 
  icon: Icon = Package, 
  action,
  isRTL = true 
}) => {
  return (
    <Card className={`text-right py-12`}>
      <Icon className={`mx-auto w-12 h-12 text-primary-300 mb-4 ${isRTL ? 'ml-auto mr-0' : ''}`} />
      <p className="text-gray-600 text-lg">{message}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-2">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
};

export default EmptyState;

