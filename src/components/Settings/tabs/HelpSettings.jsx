import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
// import { useOnboarding } from '../../../contexts/OnboardingContext'; // DISABLED: Onboarding disabled
import { FileTextOutlined as DocumentTextIcon, ExportOutlined as ArrowTopRightOnSquareIcon } from '@ant-design/icons';
// import { Button } from '../../ui'; // DISABLED: Not needed without onboarding

const HelpSettings = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    // const { restartOnboarding } = useOnboarding(); // DISABLED: Onboarding disabled

    const handleOpenDocumentation = () => {
        // Navigate to the setup guide page
        navigate('/settings/woocommerce-setup');
    };

    // DISABLED: Onboarding restart functionality
    // const handleRestartOnboarding = async () => {
    //     if (window.confirm(t('onboarding.restartConfirm') || 'האם אתה בטוח שברצונך להתחיל מחדש את סיור ההיכרות?')) {
    //         await restartOnboarding();
    //     }
    // };

    return (
        <div className="space-y-6">
            {/* Restart Onboarding - DISABLED */}
            {/* <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <ArrowPathIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 text-right">
                        <h3 className="text-lg font-semibold text-primary-900 mb-2">
                            {t('onboarding.restartTitle') || 'התחל מחדש את סיור ההיכרות'}
                        </h3>
                        <p className="text-sm text-primary-800 mb-4">
                            {t('onboarding.restartDescription') || 'אם תרצה לראות שוב את סיור ההיכרות, תוכל להתחיל אותו מחדש מכאן.'}
                        </p>
                        <Button
                            onClick={handleRestartOnboarding}
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>{t('onboarding.restartButton') || 'התחל מחדש סיור'}</span>
                        </Button>
                    </div>
                </div>
            </div> */}

            {/* Documentation Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 text-right">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            {t('fullDocumentation') || 'מדריך הגדרה מלא'}
                        </h3>
                        <p className="text-sm text-blue-800 mb-4">
                            {t('documentationDescription') || 'לקבלת מדריך מפורט עם הוראות שלב אחר שלב, פתרון בעיות וטיפים לאבטחה, עיין במדריך המלא.'}
                        </p>
                        <button
                            onClick={handleOpenDocumentation}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <span>{t('openFullGuide') || 'פתח מדריך מלא'}</span>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4 text-right">
                    {t('howToGetAPICredentials') || 'איך לקבל פרטי API - מדריך מהיר'}
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-primary-800 text-right">
                    <li>{t('apiStep1') || 'התחבר לפאנל הניהול של WooCommerce'}</li>
                    <li>{t('apiStep2') || 'נווט אל WooCommerce → הגדרות → מתקדם → REST API'}</li>
                    <li>{t('apiStep3') || 'לחץ על "הוסף מפתח" כדי ליצור מפתח API חדש'}</li>
                    <li>{t('apiStep4') || 'הגדר את התיאור והרשאות המשתמש (קריאה/כתיבה)'}</li>
                    <li>{t('apiStep5') || 'העתק את מפתח הצרכן וסוד הצרכן'}</li>
                    <li>{t('apiStep6') || 'הדבק אותם בשדות למעלה ושמור'}</li>
                </ol>
            </div>

            {/* Security Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2 text-right">
                    {t('securityNote') || 'הערת אבטחה'}
                </h3>
                <p className="text-sm text-yellow-800 text-right mb-3">
                    {t('securityText') || 'להגדרות קבועות, שמור את הפרטים האלה כמשתני סביבה. צור קובץ .env עם:'}
                </p>
                <pre className="mt-2 p-3 bg-yellow-100 rounded text-xs overflow-x-auto text-right">
                    {`VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
VITE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx`}
                </pre>
            </div>

            {/* Troubleshooting Quick Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                    {t('commonIssues') || 'בעיות נפוצות'}
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 text-right">
                    <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>
                            <strong>{t('issueConnection') || 'חיבור נכשל?'}</strong> {' '}
                            {t('issueConnectionSolution') || 'ודא שהכתובת מתחילה ב-https:// ושהמפתחות הועתקו במלואם'}
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>
                            <strong>{t('issuePermissions') || 'אין הרשאות?'}</strong> {' '}
                            {t('issuePermissionsSolution') || 'ודא שמפתח ה-API מוגדר להרשאות קריאה/כתיבה'}
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>
                            <strong>{t('issueImages') || 'תמונות לא עולות?'}</strong> {' '}
                            {t('issueImagesSolution') || 'ודא שהגדרת את שם המשתמש וסיסמת האפליקציה של WordPress'}
                        </span>
                    </li>
                </ul>
                <p className="text-xs text-gray-600 mt-4 text-right">
                    {t('forMoreHelp') || 'לפתרון בעיות מפורט יותר, עיין במדריך המלא למעלה'}
                </p>
            </div>
        </div>
    );
};

export default HelpSettings;
