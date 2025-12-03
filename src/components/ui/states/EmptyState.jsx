import StatusMessage from './StatusMessage';
import { CubeIcon as Package } from '@heroicons/react/24/outline';

/**
 * EmptyState Component
 * 
 * Reusable empty state display component.
 * Wrapper around StatusMessage.
 */
const EmptyState = ({
  message,
  description,
  icon = Package,
  action,
  isRTL = true
}) => {
  return (
    <StatusMessage
      type="empty"
      message={
        <>
          <span className="block font-medium text-lg mb-1">{message}</span>
          {description && <span className="block text-sm text-gray-500">{description}</span>}
        </>
      }
      icon={icon}
      action={action}
    />
  );
};

export default EmptyState;

