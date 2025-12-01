import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CalculatorInfoCard Component
 * 
 * Information card listing what the calculator includes
 */
const CalculatorInfoCard = () => {
  const { t } = useLanguage();

  return (
    <div className="card bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-2 text-right">
        {t('whatCalculatorIncludes') || 'מה המחשבון כולל'}
      </h3>
      <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 text-right">
        <li>{t('includesSupplierCost') || 'עלות ספק'}</li>
        <li>{t('includesShippingCost') || 'עלות משלוח'}</li>
        <li>{t('includesCustomsFees') || 'מכס או אגרות יבוא'}</li>
        <li>{t('includesPackagingCost') || 'עלות אריזה'}</li>
        <li>{t('includesPlatformFees') || 'עמלות פלטפורמה או עסקאות'}</li>
        <li>{t('includesCustomCosts') || 'עלויות נוספות/מותאמות אישית (אופציונלי)'}</li>
        <li>{t('includesDesiredMargin') || 'אחוז שולי רווח רצוי'}</li>
        <li>{t('includesFinalPrice') || 'מחיר מכירה מומלץ סופי'}</li>
        <li>{t('includesBreakdown') || 'פירוט שקוף של עלויות כוללות ורווח'}</li>
      </ul>
    </div>
  );
};

export default CalculatorInfoCard;




