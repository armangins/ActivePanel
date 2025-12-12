import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { authAPI } from '../../services/api';

import { validateLoginForm, checkLoginRateLimit, authenticateUser } from '../../utils/loginHelpers';
import {
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  ArrowPathIcon as Loader
} from '@heroicons/react/24/outline';
import { Input } from '../ui/inputs';
import { Button } from '../ui';
import LoginWelcomePanel from './LoginWelcomePanel';

// Get API URL and enforce HTTPS in production
let API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

// Enforce HTTPS in production
if (import.meta.env.PROD && API_URL.startsWith('http://')) {
  console.warn('⚠️  WARNING: API_URL uses HTTP in production. Converting to HTTPS.');
  API_URL = API_URL.replace('http://', 'https://');
}

// VITE_API_URL already includes /api, so just append /auth/google
const GOOGLE_LOGIN_URL = API_URL.endsWith('/api') 
  ? `${API_URL}/auth/google` 
  : `${API_URL}/api/auth/google`;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is coming back from Google OAuth (check URL params)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    
    if (error === 'google_auth_failed') {
      // Handle specific error cases
      if (errorMessage) {
        // Decode URL-encoded message
        const decodedMessage = decodeURIComponent(errorMessage);
        setError(decodedMessage || t('googleLoginError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      } else {
        setError(t('googleLoginError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      }
    } else if (error === 'true') {
      setError(t('googleLoginError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
    }
    
    // If already authenticated, redirect to dashboard
    // Also check after a delay to handle Google OAuth redirect case
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // After Google OAuth redirect, wait a bit for session to be established
      // then check authentication again
      const checkAuthAfterRedirect = setTimeout(async () => {
        try {
          const currentUser = await authAPI.getCurrentUser();
          if (currentUser) {
            login(currentUser);
            navigate('/dashboard');
          }
        } catch (err) {
          // User not authenticated, stay on login page
        }
      }, 1000); // Wait 1 second for session cookie to be set
      
      return () => clearTimeout(checkAuthAfterRedirect);
    }
  }, [isAuthenticated, navigate, login, t]);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = GOOGLE_LOGIN_URL;
  }, []);

  const handleEmailLogin = useCallback(async (e) => {
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
  }, [email, password, login, navigate]);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 lg:mb-8">
            <img
              src="/logo.svg"
              alt="ActivePanel"
              className="h-10 lg:h-12 mb-4 lg:mb-6"
            />
          </div>

          {/* Sign In Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
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
              <p className="mb-2">{error}</p>
              {(error.includes('No account found') || error.includes('sign up')) && (
                <p className="text-xs mt-2">
                  {t('dontHaveAccount') || 'אין לך חשבון?'}{' '}
                  <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium underline">
                    {t('signUp') || 'הירשם כאן'}
                  </Link>
                </p>
              )}
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
              autoCapitalize="none"
              autoCorrect="off"
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
              autoCapitalize="none"
              autoCorrect="off"
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
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-[18px] h-[18px] animate-spin" />
                  {t('loggingIn') || 'מתחבר...'}
                </span>
              ) : (
                t('signIn') || 'התחבר'
              )}
            </Button>

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

          {/* Google Login Button */}
          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {t('signInWithGoogle') || 'התחבר עם Google'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Welcome Message */}
      <LoginWelcomePanel />
    </div>
  );
};

export default Login;
