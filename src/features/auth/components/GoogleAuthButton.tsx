import { Button, ButtonProps } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { redirectToGoogleAuth } from '@/utils/googleAuth';

interface GoogleAuthButtonProps extends ButtonProps {
    className?: string;
}

export const GoogleAuthButton = ({ className = '', style, ...props }: GoogleAuthButtonProps) => {
    const { t } = useLanguage();

    return (
        <Button
            onClick={redirectToGoogleAuth}
            block
            className={className}
            style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                backgroundColor: '#fff',
                borderColor: '#d9d9d9',
                color: '#595959',
                ...style
            }}
            {...props}
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
