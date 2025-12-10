import { ArrowRightIcon as ArrowRight, XMarkIcon as X } from '@heroicons/react/24/outline';
import { Card } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * ScheduleModal Component
 * 
 * Modal for scheduling sale start and end dates.
 */
const ScheduleModal = ({ isOpen, onClose, scheduleDates, onDatesChange, onSave }) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <Card className="w-full max-w-md p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <h3 className="text-lg font-semibold text-gray-800 text-right">{t('schedule')}</h3>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title={t('back') || 'חזור'}
              >
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('saleStartDate') || 'תאריך התחלת מבצע'}
              </label>
              <input
                type="datetime-local"
                value={scheduleDates.start ? (scheduleDates.start.includes('T') ? scheduleDates.start.slice(0, 16) : scheduleDates.start + 'T00:00') : ''}
                onChange={(e) => onDatesChange({ ...scheduleDates, start: e.target.value })}
                className="input-field text-right w-full"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('saleEndDate') || 'תאריך סיום מבצע'}
              </label>
              <input
                type="datetime-local"
                value={scheduleDates.end ? (scheduleDates.end.includes('T') ? scheduleDates.end.slice(0, 16) : scheduleDates.end + 'T00:00') : ''}
                onChange={(e) => onDatesChange({ ...scheduleDates, end: e.target.value })}
                className="input-field text-right w-full"
                dir="rtl"
              />
            </div>

            <div className={`flex gap-2 pt-4 flex-row-reverse`}>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
              >
                {t('cancel') || 'ביטול'}
              </button>
              <button
                onClick={onSave}
                className="flex-1 btn-primary text-center flex items-center justify-center"
              >
                {t('save') || 'שמור'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ScheduleModal;

