import { useState, useEffect, useRef } from 'react';
import { XMarkIcon as X, CalculatorIcon as CalculatorIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import Calculator from '../Calculator/Calculator';

/**
 * CalculatorModal Component
 * 
 * Modal wrapper for the Smart Pricing Calculator
 * Allows setting the calculated price back to the product form
 */
const CalculatorModal = ({ onClose, onSetPrice }) => {
  const { t, formatCurrency } = useLanguage();
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const calculatorRef = useRef(null);

  // Listen for price updates from calculator
  useEffect(() => {
    const handlePriceUpdate = (event) => {
      if (event.detail && event.detail.sellingPrice) {
        setCalculatedPrice(event.detail.sellingPrice);
      }
    };

    window.addEventListener('calculatorPriceUpdate', handlePriceUpdate);
    return () => {
      window.removeEventListener('calculatorPriceUpdate', handlePriceUpdate);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] max-w-4xl overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6 text-primary-500" />
                {t('smartPricing') || 'מחיר חכם'}
              </h2>
              {calculatedPrice && (
                <button
                  type="button"
                  onClick={() => {
                    if (calculatedPrice) {
                      onSetPrice(calculatedPrice.toFixed(2));
                    }
                  }}
                  className="text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-md transition-colors font-medium"
                >
                  {t('useThisPrice') || 'השתמש במחיר זה'}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('close') || 'סגור'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <Calculator 
              ref={calculatorRef}
              isModalMode={true}
              onUsePrice={(price) => {
                onSetPrice(price);
                onClose();
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;

