import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const HelpSettings = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4 text-right">
                    {t('howToGetAPICredentials') || 'איך לקבל פרטי API'}
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
        </div>
    );
};

export default HelpSettings;
