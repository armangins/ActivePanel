import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  CheckCircleOutlined as CheckCircleIcon,
  CloseCircleOutlined as XCircleIcon,
  KeyOutlined as KeyIcon,
  GlobalOutlined as GlobeAltIcon,
  SafetyOutlined as ShieldCheckIcon,
  ExclamationCircleOutlined as ExclamationTriangleIcon,
  DownOutlined as ChevronDownIcon,
  UpOutlined as ChevronUpIcon,
  ArrowRightOutlined as ArrowRightIcon,
  FileTextOutlined as DocumentTextIcon,
  LockOutlined as LockClosedIcon,
  UserOutlined as UserIcon,
  ImageOutlined as PhotoIcon,
  LinkOutlined as LinkIcon,
  CopyOutlined as ClipboardDocumentIcon,
  CheckOutlined as ClipboardDocumentCheckIcon
} from '@ant-design/icons';
import { Button } from '../ui';

const WooCommerceSetupGuide = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [copiedText, setCopiedText] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    prerequisites: true,
    step1: true,
    step2: false,
    step3: false,
    troubleshooting: false,
    security: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const CodeBlock = ({ children, copyable = false, id }) => {
    return (
      <div className="relative group">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
          <code>{children}</code>
        </pre>
        {copyable && (
          <button
            onClick={() => copyToClipboard(children, id)}
            className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
            title="העתק ללוח"
          >
            {copiedText === id ? (
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  const StepCard = ({ number, title, icon: Icon, children, completed = false }) => (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
          completed ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {completed ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          ) : (
            <span className="text-lg font-bold text-blue-600">{number}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && <Icon className="w-6 h-6 text-gray-600" />}
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );

  const InfoBox = ({ type = 'info', title, children }) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900'
    };

    const icons = {
      info: DocumentTextIcon,
      warning: ExclamationTriangleIcon,
      success: CheckCircleIcon,
      error: XCircleIcon
    };

    const Icon = icons[type];

    return (
      <div className={`border rounded-lg p-4 ${styles[type]}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {title && <h4 className="font-semibold mb-2">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  const CollapsibleSection = ({ id, title, icon: Icon, children, defaultOpen = false }) => {
    const isOpen = expandedSections[id] ?? defaultOpen;
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-gray-600" />}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isOpen && (
          <div className="p-5 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <KeyIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              מדריך הגדרת WooCommerce
            </h1>
            <p className="text-gray-600 mt-1">
              חבר את חנות ה-WooCommerce שלך תוך דקות
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Button
            onClick={() => navigate('/settings')}
            variant="primary"
            className="flex items-center gap-2"
          >
            <ArrowRightIcon className="w-4 h-4" />
            עבור להגדרות
          </Button>
          <div className="text-sm text-gray-500">
            ⏱️ זמן משוער: 5 דקות
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <CollapsibleSection
        id="prerequisites"
        title="דרישות מוקדמות"
        icon={CheckCircleIcon}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">גישה לפאנל הניהול של WordPress בחנות ה-WooCommerce שלך</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">תפקיד מנהל או מנהל חנות ב-WordPress</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">כתובת האתר שלך (למשל: https://your-store.com)</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">HTTPS מופעל בחנות שלך (נדרש לחיבורי API מאובטחים)</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 1: Create API Keys */}
      <div className="mt-6">
        <StepCard
          number="1"
          title="צור מפתחות API של WooCommerce"
          icon={KeyIcon}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5" />
                גש להגדרות WooCommerce
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-7">
                <li>התחבר לפאנל הניהול של WordPress</li>
                <li>נווט אל WooCommerce → הגדרות → מתקדם → REST API</li>
                <li>לחץ על הכפתור "הוסף מפתח"</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <KeyIcon className="w-5 h-5" />
                צור מפתח API
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-7">
                <li>הכנס תיאור (למשל: "אפליקציית דשבורד מסחר אלקטרוני")</li>
                <li>בחר את חשבון המשתמש שלך ב-WordPress</li>
                <li>הגדר הרשאות לקריאה/כתיבה</li>
                <li>לחץ על "צור מפתח API"</li>
              </ol>
            </div>

            <InfoBox type="warning" title="חשוב">
              העתק את מפתח הצרכן וסוד הצרכן מיד. סוד הצרכן יוצג רק פעם אחת ולא ניתן לאחזר אותו מאוחר יותר.
            </InfoBox>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">הפרטים שלך ייראו כך:</h4>
              <CodeBlock copyable id="consumer-key-example">
                Consumer Key: ck_1234567890abcdef1234567890abcdef12345678
              </CodeBlock>
              <CodeBlock copyable id="consumer-secret-example">
                Consumer Secret: cs_abcdef1234567890abcdef1234567890abcdef
              </CodeBlock>
            </div>
          </div>
        </StepCard>
      </div>

      {/* Step 2: Configure in App */}
      <div className="mt-6">
        <StepCard
          number="2"
          title="הגדר הגדרות באפליקציה"
          icon={GlobeAltIcon}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">הכנס את פרטי החנות שלך</h4>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-7">
                <li>
                  <strong>כתובת אתר WooCommerce:</strong> הכנס את כתובת הבסיס של החנות שלך (למשל: https://your-store.com)
                </li>
                <li>
                  <strong>מפתח צרכן:</strong> הדבק את מפתח הצרכן שהעתקת (מתחיל ב-ck_)
                </li>
                <li>
                  <strong>סוד צרכן:</strong> הדבק את סוד הצרכן שהעתקת (מתחיל ב-cs_)
                </li>
              </ol>
            </div>

            <InfoBox type="info" title="טיפ">
              תוכל לגשת לדף ההגדרות על ידי לחיצה על הכפתור "עבור להגדרות" למעלה או ניווט להגדרות בתפריט הצד.
            </InfoBox>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">פורמט כתובת האתר</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <code className="bg-white px-2 py-1 rounded">https://your-store.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                  <code className="bg-white px-2 py-1 rounded">http://your-store.com</code>
                  <span className="text-gray-500">(לא HTTP, חייב להשתמש ב-HTTPS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                  <code className="bg-white px-2 py-1 rounded">https://your-store.com/</code>
                  <span className="text-gray-500">(ללא סלאש בסוף)</span>
                </div>
              </div>
            </div>
          </div>
        </StepCard>
      </div>

      {/* Step 3: WordPress Integration */}
      <div className="mt-6">
        <StepCard
          number="3"
          title="אינטגרציה עם WordPress (אופציונלי)"
          icon={PhotoIcon}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              אם תרצה להעלות תמונות מוצרים וקבצי מדיה דרך האפליקציה, תצטרך להגדיר סיסמאות אפליקציה של WordPress.
            </p>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                צור סיסמת אפליקציה של WordPress
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-7">
                <li>בפאנל הניהול של WordPress, עבור אל משתמשים → פרופיל</li>
                <li>גלול למקטע סיסמאות אפליקציה</li>
                <li>הכנס שם (למשל: "דשבורד מסחר אלקטרוני")</li>
                <li>לחץ על "הוסף סיסמת אפליקציה חדשה"</li>
                <li>העתק את הסיסמה שנוצרה (תוצג רק פעם אחת)</li>
              </ol>
            </div>

            <InfoBox type="info">
              הסיסמה תוצג בפורמט: xxxx xxxx xxxx xxxx xxxx xxxx (עם רווחים). תוכל לכלול או להחריג את הרווחים בעת ההזנה.
            </InfoBox>
          </div>
        </StepCard>
      </div>

      {/* Troubleshooting */}
      <CollapsibleSection
        id="troubleshooting"
        title="פתרון בעיות"
        icon={ExclamationTriangleIcon}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              בדיקת החיבור נכשלת
            </h4>
            <ul className="space-y-2 text-gray-700 ml-7">
              <li className="list-disc">✓ ודא שכתובת האתר שלך מתחילה ב-https:// (לא http://)</li>
              <li className="list-disc">✓ בדוק שלמפתח ה-API יש הרשאות קריאה/כתיבה</li>
              <li className="list-disc">✓ ודא שלאתר שלך יש תעודת SSL תקינה</li>
              <li className="list-disc">✓ בדוק אם תוספי אבטחה חוסמים בקשות REST API</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-yellow-600" />
              מפתח צרכן/סוד צרכן לא תקין
            </h4>
            <ul className="space-y-2 text-gray-700 ml-7">
              <li className="list-disc">✓ בדוק שוב שהעתקת את המפתח המלא (מתחיל ב-ck_ או cs_)</li>
              <li className="list-disc">✓ ודא שאין רווחים נוספים לפני או אחרי</li>
              <li className="list-disc">✓ ודא שהמפתח לא בוטל בהגדרות WooCommerce</li>
              <li className="list-disc">✓ נסה ליצור מפתח API חדש אם הסוד אבד</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PhotoIcon className="w-5 h-5 text-blue-600" />
              תמונות לא עולות
            </h4>
            <ul className="space-y-2 text-gray-700 ml-7">
              <li className="list-disc">✓ ודא ששם המשתמש וסיסמת האפליקציה של WordPress מוגדרים</li>
              <li className="list-disc">✓ ודא שלמשתמש WordPress יש הרשאה להעלות מדיה</li>
              <li className="list-disc">✓ בדוק את מגבלות גודל הקבצים בהגדרות WordPress</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      {/* Security Best Practices */}
      <CollapsibleSection
        id="security"
        title="שיטות עבודה מומלצות לאבטחה"
        icon={ShieldCheckIcon}
      >
        <div className="space-y-4">
          <InfoBox type="warning" title="הגן על מפתחות ה-API שלך">
            <ul className="space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>לעולם אל תשתף את המפתחות שלך בפומבי או תעלה אותם למערכת בקרת גרסאות</span>
              </li>
              <li className="flex items-start gap-2">
                <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>השתמש בהרשאות קריאה/כתיבה רק כשצריך</span>
              </li>
              <li className="flex items-start gap-2">
                <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>החלף מפתחות באופן קבוע ובטל מפתחות שלא בשימוש</span>
              </li>
              <li className="flex items-start gap-2">
                <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>תמיד השתמש ב-HTTPS (לעולם לא HTTP) לכתובת האתר שלך</span>
              </li>
            </ul>
          </InfoBox>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">מעקב אחר שימוש ב-API</h4>
            <p className="text-sm text-gray-700">
              בדוק באופן קבוע את יומני ה-REST API של WooCommerce שלך לפעילות חריגה. בטל מפתחות מיד אם מזוהה פעילות חשודה.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Footer CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              מוכן לחבר את החנות שלך?
            </h3>
            <p className="text-gray-600 text-sm">
              עבור להגדרות כדי להזין את הפרטים שלך ולהתחיל לנהל את החנות שלך.
            </p>
          </div>
          <Button
            onClick={() => navigate('/settings')}
            variant="primary"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            עבור להגדרות
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WooCommerceSetupGuide;

