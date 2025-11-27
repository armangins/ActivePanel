import { Calculator as CalculatorIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CalculatorHeader Component
 * 
 * Header section for the calculator page
 */
const CalculatorHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 text-right">
          {t('smartPricingCalculator') || 'מחשבון מחירים חכם'}
        </h1>
        <p className="text-sm text-gray-600 mt-1 text-right">
          {t('pricingCalculatorDesc') || 'קבע מחירי מכירה מדויקים על בסיס עלויות אמיתיות ושולי רווח רצויים'}
        </p>
      </div>
      <div className="bg-primary-100 p-4 rounded-lg">
        <CalculatorIcon size={32} className="text-primary-600" />
      </div>
    </div>
  );
};

export default CalculatorHeader;

