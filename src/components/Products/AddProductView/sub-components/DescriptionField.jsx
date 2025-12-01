import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * DescriptionField Component
 * 
 * Textarea for full description with AI improvement button and word count.
 */
const DescriptionField = ({ value, onChange, onImprove, isImproving, error }) => {
  const { t } = useLanguage();
  
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleChange = (e) => {
    const newValue = e.target.value;
    const newWordCount = newValue.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (newWordCount <= 400) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
        {t('description')}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={t('enterDetailedDescription') || 'הכנס תיאור מפורט יותר של המוצר'}
          className={`input-field min-h-[150px] resize-none text-right  ${error ? 'border-orange-500' : ''}`}
          dir="rtl"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (value.trim()) {
              onImprove();
            }
          }}
          disabled={isImproving || !value.trim()}
          className={`absolute left-2 top-2 p-1.5 rounded-lg transition-colors z-10 ${
            isImproving || !value.trim()
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700 cursor-pointer'
          }`}
          title={t('createWithAI') || 'צור בעזרת AI'}
        >
          {isImproving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-orange-500 text-xs mt-1 text-right">{error}</p>
      )}
      <p className="text-xs text-gray-500 mt-1 text-right">
        {wordCount}/400 {t('words') || 'מילים'}
      </p>
    </div>
  );
};

export default DescriptionField;

