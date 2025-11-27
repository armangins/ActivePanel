import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { authenticateWithEmail } from '../../services/auth';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@mail.com');
  const [password, setPassword] = useState('admin');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.warn('VITE_GOOGLE_CLIENT_ID is not set');
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          const buttonElement = document.getElementById('google-signin-button');
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              locale: 'he',
              width: '100%',
            });
          }
        }
      }, 100);
    };

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const handleCredentialResponse = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);
      
      const user = {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
      };

      login(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error decoding credential:', error);
      setError('שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('אנא מלא את כל השדות');
        setLoading(false);
        return;
      }

      const user = await authenticateWithEmail(email, password);
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/logo.svg" 
              alt="ActivePanel" 
              className="h-12 mb-6"
            />
          </div>

          {/* Sign In Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('signIn') || 'התחבר'}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {t('dontHaveAccount') || 'אין לך חשבון?'}{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
              {t('signUp') || 'הירשם'}
            </a>
          </p>

          {/* Demo Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-blue-800">
              {t('demoInfo') || 'אתה גולש ב-ActivePanel Demo. לחץ על כפתור "התחבר" כדי לגשת לדמו ולתיעוד.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 text-sm text-right">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form id="login-form" name="loginForm" onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('emailAddress') || 'כתובת אימייל'} *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterEmail') || 'הכנס אימייל'}
                  className="input-field pl-10 text-right placeholder:pr-2"
                  dir="ltr"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('password') || 'סיסמה'} *
              </label>
              <div className="relative">
              
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword') || 'הכנס סיסמה'}
                  className="input-field pl-10 pl-10 text-right placeholder:pr-2"
                  dir="rtl"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t('rememberMe') || 'זכור אותי'}</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">
                {t('forgotPassword') || 'שכחת סיסמה?'}
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  {t('loggingIn') || 'מתחבר...'}
                </span>
              ) : (
                t('signIn') || 'התחבר'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('orContinueWith') || 'או המשך עם'}</span>
              </div>
            </div>
          </form>

          {/* Google Login Button - Outside form */}
          <div className="mt-6">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('googleClientIdMissing') || 'Google Sign-In לא מוגדר. אנא הגדר VITE_GOOGLE_CLIENT_ID ב-.env'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Welcome Message */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h2 className="text-4xl font-bold mb-6">
            {t('welcomeToCommunity') || 'ברוכים הבאים לקהילה שלנו'}
          </h2>
          
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            {t('welcomeDescription') || 'ActivePanel עוזרת לבעלי עסקים וחנויות אינטרנטיות לנהל את הפעילות שלהם בצורה חכמה, מסודרת ויעילה — עם לוחות בקרה, מודולים ברורים וממשק נעים, מבוסס AI ומונחה נתונים (Data-driven) שמסדר את כל המידע בעסק.'}
          </p>
          
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            {t('welcomeDescription2') || 'הצטרף אלינו והתחל לנהל את העסק שלך בצורה פשוטה וחכמה יותר כבר היום.'}
          </p>

          {/* User Avatars */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white font-semibold">
                א
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white font-semibold">
                ב
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white flex items-center justify-center text-white font-semibold">
                ג
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white font-semibold">
                ד
              </div>
            </div>
            <p className="text-gray-300">
              {t('communityStats') || 'יותר מ-17 אלף אנשים הצטרפו אלינו, תורך עכשיו.'}
            </p>
          </div>
        </div>

        {/* Settings Icon */}
        <button className="absolute top-6 left-6 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Login;
