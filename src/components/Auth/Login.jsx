import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { validateLoginForm, checkLoginRateLimit, authenticateUser } from '../../utils/loginHelpers';
import { 
  EnvelopeIcon as Mail, 
  LockClosedIcon as Lock, 
  ArrowPathIcon as Loader
} from '@heroicons/react/24/outline';
import { Input } from '../ui/inputs';
import LoginWelcomePanel from './LoginWelcomePanel';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@mail.com');
  const [password, setPassword] = useState('admin');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle Google Sign-In success
  const handleGoogleSignInSuccess = useCallback((user) => {
    setLoading(true);
    setError('');
    login(user);
    navigate('/dashboard');
  }, [login, navigate]);

  // Handle Google Sign-In error
  const handleGoogleSignInError = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  // Initialize Google Sign-In
  useGoogleSignIn(handleGoogleSignInSuccess, handleGoogleSignInError);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      const validation = validateLoginForm(email, password);
      if (!validation.isValid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      // Check rate limiting
      const rateLimitCheck = checkLoginRateLimit(email);
      if (!rateLimitCheck.allowed) {
        setError(rateLimitCheck.error);
        setLoading(false);
        return;
      }

      // Authenticate user
      const user = await authenticateUser(email, password);
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
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
              {t('signUp') || 'הירשם'}
            </Link>
          </p>

          {/* Demo Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-blue-800">
              {t('demoInfo') || 'אתה גולש ב-ActivePanel Demo. לחץ על כפתור "התחבר" כדי לגשת לדמו ולתיעוד.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 mb-6 text-sm text-right">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form id="login-form" name="loginForm" onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Field */}
            <Input
              id="login-email"
              name="email"
              type="email"
              label={t('emailAddress') || 'כתובת אימייל'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enterEmail') || 'הכנס אימייל'}
              leftIcon={Mail}
              required
              disabled={loading}
              autoComplete="email"
              dir="ltr"
            />

            {/* Password Field */}
            <Input
              id="login-password"
              name="password"
              type="password"
              label={t('password') || 'סיסמה'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enterPassword') || 'הכנס סיסמה'}
              leftIcon={Lock}
              required
              disabled={loading}
              autoComplete="current-password"
              dir="rtl"
            />

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
                  <Loader className="w-[18px] h-[18px] animate-spin" />
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
      <LoginWelcomePanel />
    </div>
  );
};

export default Login;
