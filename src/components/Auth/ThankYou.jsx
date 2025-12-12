import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui';
import { GoogleAuthButton } from './GoogleAuthButton';

const ThankYou = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('accountCreatedSuccessfully') || 'החשבון נוצר בהצלחה!'}
        </h1>

        <p className="text-gray-600 mb-2">
          {t('accountCreatedMessage') || 'החשבון שלך נוצר בהצלחה. כעת תוכל להתחבר עם Google.'}
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          {t('nextStepSignIn') || 'לחץ על הכפתור למטה כדי להתחבר לחשבון שלך'}
        </p>

        {/* Sign in with Google Button */}
        <div className="space-y-4">
          <GoogleAuthButton 
            variant="primary"
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 border-0 text-white"
          />

          {/* Back to Login Link */}
          <p className="text-sm text-gray-600">
            {t('or') || 'או'}{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              {t('backToLogin') || 'חזור לדף ההתחברות'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
