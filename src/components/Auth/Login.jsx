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
import { GoogleAuthButton } from './GoogleAuthButton';

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
    const errorCode = urlParams.get('code');
    const success = urlParams.get('success');


    // Handle Google authentication errors (works for both login and signup)
    if (error === 'google_auth_failed' || error === 'google_signup_failed') {
      if (errorMessage) {
        const decodedMessage = decodeURIComponent(errorMessage);
        // Only log in development for debugging
        if (import.meta.env.DEV) {
          console.log('⚠️  Google authentication error:', decodedMessage);
        }
        setError(decodedMessage || t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      } else {
        setError(t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      }
      // Clean up URL params after setting error
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    else if (error === 'true') {
      setError(t('googleAuthError') || 'שגיאה בהתחברות עם Google. אנא נסה שוב.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // If no error but we have URL params, log only in development
    else if (window.location.search && !error && !success && import.meta.env.DEV) {
      console.warn('⚠️  Unexpected URL params on login page:', window.location.search);
    }

    // If already authenticated, redirect to dashboard
    // Add a small delay after OAuth redirect to ensure session cookie is available
    if (isAuthenticated) {
      // If we're on login page and authenticated, wait a bit for session to be fully established
      const isOAuthRedirect = window.location.pathname === '/login' && !error;
      if (isOAuthRedirect) {
        // Small delay to ensure session cookie is available
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    // Note: AuthContext handles periodic auth checks after OAuth redirect
    // No need to poll here to avoid rate limiting
  }, [isAuthenticated, navigate, login, t]);


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

      // Authenticate user - returns { user, accessToken }
      const { user, accessToken } = await authenticateUser(email, password);

      // Login with JWT - pass user data and access token
      login(user, accessToken);

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
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              התחברו והתחילו לנהל את החנות שלכם
            </h2>
            <p className="text-xs text-gray-400 font-mono">v2.1 Mobile Fix</p>
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
              אתם גולשים כרגע בגרסת הדמו של Active Panel תהנו !
            </div>
          </div> {/* Info message if user just signed up but ended up here */}
          {!error && window.location.search.includes('signup') && (
            <div className="bg-green-50 border-2 border-green-300 text-green-900 rounded-lg p-4 mb-6 text-sm text-right shadow-md">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold mb-2">{t('signupCompleted') || 'ההרשמה הושלמה בהצלחה!'}</p>
                  <p className="mb-3">{t('pleaseSignIn') || 'כעת תוכל להתחבר עם Google או עם אימייל וסיסמה.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-orange-50 border-2 border-orange-300 text-orange-900 rounded-lg p-4 mb-6 text-sm text-right shadow-md">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-semibold text-base">{error}</p>
              </div>

              {/* Note: "No account found" errors no longer occur since accounts are auto-created via Google OAuth */}

              {/* Show login link for "user already exists" errors */}
              {(error.includes('already exists') || error.includes('User already exists')) && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs mb-2 text-orange-700">
                    {t('accountExists') || 'החשבון כבר קיים'}
                  </p>
                  <GoogleAuthButton
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs py-2"
                  />
                </div>
              )}

              {/* Show email/password login link for "account exists but not with Google" errors */}
              {error.includes('Account exists but was not created with Google') && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs text-orange-700">
                    {t('useEmailPassword') || 'אנא השתמש בהתחברות עם אימייל וסיסמה'}
                  </p>
                </div>
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

          {/* Google Authentication Button */}
          <div className="mt-6">
            <GoogleAuthButton />
          </div>
        </div>
      </div>

      {/* Right Panel - Welcome Message */}
      <LoginWelcomePanel />
    </div>
  );
};

export default Login;
