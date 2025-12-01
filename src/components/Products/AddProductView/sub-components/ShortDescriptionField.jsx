import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * ShortDescriptionField Component
 * 
 * Textarea for short description with AI improvement button.
 */
const ShortDescriptionField = ({ value, onChange, onImprove, isImproving }) => {
  const { t } = useLanguage();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
        {t('shortDescription') || 'תיאור קצר'}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('enterShortDescription') || 'הכנס תיאור קצר'}
          className="input-field min-h-[80px] resize-none text-right"
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
    </div>
  );
};

export default ShortDescriptionField;

