import { useLanguage } from '../../contexts/LanguageContext';

/**
 * MarginSelector Component
 * 
 * Component for selecting desired profit margin percentage
 * 
 * @param {string} value - Selected margin value
 * @param {Function} onChange - Change handler
 */
const MarginSelector = ({ value, onChange, error }) => {
  const { t } = useLanguage();
  const margins = [25, 30, 35, 40];

  return (
    <div>
      <label htmlFor="desired-margin" className="block text-sm font-normal text-gray-700 mb-2 text-right">
        {t('desiredMarginPercentage') || 'אחוז שולי רווח רצוי'} *
      </label>
      <div className="grid grid-cols-4 gap-3" role="group" aria-labelledby="desired-margin">
        {margins.map((margin) => (
          <button
            key={margin}
            id={`margin-${margin}`}
            name="desiredMargin"
            type="button"
            value={margin}
            onClick={() => onChange(margin.toString())}
            className={`p-4 border-2 rounded-lg transition-all flex items-center justify-center ${
              value === margin.toString()
                ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                : error
                ? 'border-orange-300 hover:border-orange-400 text-gray-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
            aria-pressed={value === margin.toString()}
          >
            <span>{margin}%</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-xs text-orange-500 mt-1 text-right">{error}</p>
      )}
    </div>
  );
};

export default MarginSelector;

