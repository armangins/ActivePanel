import { useState, useEffect } from 'react';
import { registerSchema } from '../../schemas/auth';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerUser } from '../../services/auth';
import { authAPI } from '../../services/api';
import { validatePassword, checkRateLimit } from '../../utils/security';
import {
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  UserIcon as UserIcon,
  ArrowPathIcon as Loader
} from '@heroicons/react/24/outline';
import { Input } from '../ui/inputs';
import { Button } from '../ui';
import { GoogleAuthButton } from './GoogleAuthButton';

const USE_BACKEND_API = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);



  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Rate limiting check
      const rateLimit = checkRateLimit('signup', 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
      if (!rateLimit.allowed) {
        setError('יותר מדי ניסיונות. אנא נסה שוב בעוד כמה דקות.');
        setLoading(false);
        return;
      }

      // Schema Validation
      const validationResult = registerSchema.safeParse({
        name,
        email,
        password,
        confirmPassword
      });

      if (!validationResult.success) {
        setError(validationResult.error.issues[0].message);
        setLoading(false);
        return;
      }

      // Additional checks if any (e.g. rate limit is already done above)


      // For demo, allow simple passwords but warn
      // In production, enforce strong passwords
      if (password.length < 8) {
        // Allow but could warn user
      }

      // Use backend API
      const result = await authAPI.register(email, password, name);
      login(result.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'שגיאה בהרשמה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Panel - Sign Up Form */}
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

          {/* Sign Up Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('signUp') || 'הירשם'}
          </h1>

          <p className="text-gray-600 mb-8">
            {t('alreadyHaveAccount') || 'כבר יש לך חשבון?'}{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              {t('signIn') || 'התחבר'}
            </Link>
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 mb-6 text-sm text-right">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form id="signup-form" name="signupForm" onSubmit={handleEmailSignUp} className="space-y-6">
            {/* Name Field */}
            <Input
              id="signup-name"
              name="name"
              type="text"
              label={t('fullName') || 'שם מלא'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterFullName') || 'הכנס שם מלא'}
              leftIcon={UserIcon}
              required
              disabled={loading}
              autoComplete="name"
              dir="rtl"
            />

            {/* Email Field */}
            <Input
              id="signup-email"
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
              id="signup-password"
              name="password"
              type="password"
              label={t('password') || 'סיסמה'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enterPassword') || 'הכנס סיסמה'}
              leftIcon={Lock}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={6}
              dir="rtl"
            />

            {/* Confirm Password Field */}
            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              label={t('confirmPassword') || 'אימות סיסמה'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPassword') || 'אימות סיסמה'}
              leftIcon={Lock}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={6}
              dir="rtl"
            />

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-[18px] h-[18px] animate-spin" />
                  {t('signingUp') || 'נרשם...'}
                </span>
              ) : (
                t('signUp') || 'הירשם'
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
      </div>
    </div>
  );
};

export default SignUp;

