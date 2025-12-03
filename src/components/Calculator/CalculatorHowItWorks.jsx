import { Info } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CalculatorHowItWorks Component
 * 
 * Information card explaining how the calculator works
 */
const CalculatorHowItWorks = () => {
  const { t } = useLanguage();

  return (
    <div className="card bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div className="text-right">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('howItWorks') || 'איך זה עובד'}
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            {t('pricingCalculatorHowItWorks') || 'הזן את עלות הבסיס של המוצר מהספק שלך, יחד עם כל הוצאות נוספות כגון משלוח, מכס, אריזה, עמלות פלטפורמה או כל עלות אחרת הקשורה לרכישת המוצר. המחשבון משלב אוטומטית את כל התשומות הללו כדי לקבוע את העלות הכוללת שלך למוצר.'}
          </p>
          <p className="text-sm text-blue-800">
            {t('pricingCalculatorHowItWorks2') || 'ברגע שתבחר את אחוז השוליים הרצוי, המחשבון משתמש בנוסחת השוליים הנכונה כדי להציג לך את מחיר המכירה המדויק שאתה צריך לגבות כדי להגיע לשולי הרווח הזה.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalculatorHowItWorks;






