import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const ValidationResults = ({ results }) => {
  const { t } = useLanguage();

  if (!results) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4 flex-row-reverse">
        {results.isValid ? (
          <>
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-700">
              {t('validationPassed') || 'האימות עבר בהצלחה'}
            </h3>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-700">
              {t('validationFailed') || 'נמצאו שגיאות באימות'}
            </h3>
          </>
        )}
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>
              <p className="text-sm text-gray-600">{t('totalProducts') || 'סה"כ מוצרים'}</p>
              <p className="text-2xl font-bold text-gray-900">{results.totalProducts || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('errors') || 'שגיאות'}</p>
              <p className="text-2xl font-bold text-orange-600">{results.errors?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('warnings') || 'אזהרות'}</p>
              <p className="text-2xl font-bold text-yellow-600">{results.warnings?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {results.errors && results.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2 flex-row-reverse">
              <XCircle className="w-4 h-4" />
              {t('errors') || 'שגיאות'}
            </h4>
            <div className="space-y-2">
              {results.errors.map((error, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-right">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">{t('product')} {error.product}:</span> {error.message}
                  </p>
                  {error.field && (
                    <p className="text-xs text-orange-600 mt-1">
                      {t('field')}: {error.field}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {results.warnings && results.warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2 flex-row-reverse">
              <AlertCircle className="w-4 h-4" />
              {t('warnings') || 'אזהרות'}
            </h4>
            <div className="space-y-2">
              {results.warnings.map((warning, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-right">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">{t('product')} {warning.product}:</span> {warning.message}
                  </p>
                  {warning.field && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {t('field')}: {warning.field}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {results.isValid && results.errors.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-right">
            <p className="text-sm text-green-800">
              {t('allProductsValid') || 'כל המוצרים תקינים ומוכנים לייבוא'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationResults;








