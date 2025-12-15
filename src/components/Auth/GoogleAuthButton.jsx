import { Button } from '../ui';
import { redirectToGoogleAuth } from '../../utils/googleAuth';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Reusable Google Authentication Button
 * Works for both sign in and sign up since they do the same thing (auto-create users)
 */
export const GoogleAuthButton = ({ className = '', variant = 'outline', style = {} }) => {
  const { t } = useLanguage();

  return (
    <Button
      onClick={redirectToGoogleAuth}
      variant={variant}
      block
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#fff',
        border: '1px solid #d9d9d9',
        color: '#595959',
        ...style
      }}
    >
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google" 
        style={{ width: 20, height: 20 }} 
      />
      {t('continueWithGoogle') || 'Continue with Google'}
    </Button>
  );
};

