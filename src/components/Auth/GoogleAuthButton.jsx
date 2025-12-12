import { Button } from '../ui';
import { redirectToGoogleAuth } from '../../utils/googleAuth';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Reusable Google Authentication Button
 * Works for both sign in and sign up since they do the same thing (auto-create users)
 */
export const GoogleAuthButton = ({ className = '', variant = 'outline' }) => {
  const { t } = useLanguage();

  return (
    <Button
      onClick={redirectToGoogleAuth}
      variant={variant}
      className={`w-full flex items-center justify-center gap-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm ${className}`}
    >
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google" 
        className="w-5 h-5" 
      />
      {t('continueWithGoogle') || 'המשך עם Google'}
    </Button>
  );
};

