import { XMarkIcon as X, CubeIcon as Package } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ProductModalHeader Component
 * 
 * Header with step progress indicator for the product modal
 */
const ProductModalHeader = ({ steps, currentStep, onClose, goToStep }) => {
  const { t } = useLanguage();

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-900 text-right">
            {t('step')} {currentStep + 1} {t('of')} {steps.length}: {steps[currentStep].label}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const actualIndex = index;
          const isActive = actualIndex === currentStep;
          const isCompleted = actualIndex < currentStep;
          const isClickable = actualIndex <= currentStep;

          return (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary-500'
                  : isCompleted
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => isClickable && goToStep(actualIndex)}
              title={step.label}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductModalHeader;

