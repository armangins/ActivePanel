import { useState, useEffect, useRef } from 'react';
import { CloseOutlined as X, CalculatorOutlined as CalculatorIcon } from '@ant-design/icons';
import { Modal } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';
import Calculator from '../../Calculator/Calculator';
import { Button } from '../../ui';

/**
 * CalculatorModal Component
 * 
 * Modal wrapper for the Smart Pricing Calculator
 * Allows setting the calculated price back to the product form
 */
const CalculatorModal = ({ isOpen, onClose, onSetPrice }) => {
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
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CalculatorIcon className="w-6 h-6 text-primary-500" />
              {t('smartPricing') || 'מחיר חכם'}
            </span>
            {calculatedPrice && (
              <Button
                type="button"
                onClick={() => {
                  if (calculatedPrice) {
                    onSetPrice(calculatedPrice.toFixed(2));
                  }
                }}
                variant="ghost"
                className="text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium h-auto py-1 px-3"
              >
                {t('useThisPrice') || 'השתמש במחיר זה'}
              </Button>
            )}
          </div>
        </div>
      }
      footer={null}
      width={900}
      centered
      destroyOnHidden
    >
      <div className="py-4">
        <Calculator
          ref={calculatorRef}
          isModalMode={true}
          onUsePrice={(price) => {
            onSetPrice(price);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
};

export default CalculatorModal;

