import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ProductModalFooter Component
 * 
 * Footer with navigation buttons for the product modal
 */
const ProductModalFooter = ({
  currentStep,
  totalSteps,
  saving,
  isCurrentStepValid,
  product,
  onClose,
  handlePrevious,
  handleNext,
  handleSubmit,
}) => {
  const { t, isRTL } = useLanguage();

  return (
    <div
      className={`sticky bottom-0 flex flex-row-reverse justify-between items-center p-6 border-t border-gray-200 bg-gray-50`}
    >
      <div className={`flex flex-row-reverse items-center space-x-2 text-sm text-gray-600`}>
        <span>
          {t('step')} {currentStep + 1} {t('of')} {totalSteps}
        </span>
      </div>
      <div className={`flex flex-row-reverse space-x-3`}>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={saving}
        >
          {t('cancel')}
        </button>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className={`btn-secondary flex items-center flex-row-reverse space-x-2`}
            disabled={saving}
          >
            {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>{t('previous')}</span>
          </button>
        )}
        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`btn-primary flex items-center flex-row-reverse space-x-2`}
            disabled={saving || !isCurrentStepValid}
          >
            <span>{t('next')}</span>
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }}
            className="btn-primary"
            disabled={saving || !isCurrentStepValid}
          >
            {saving ? t('saving') : product ? t('update') : t('createProduct')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductModalFooter;

