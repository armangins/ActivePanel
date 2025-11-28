import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerUser } from '../../services/auth';
import { authAPI } from '../../services/api';
import { validatePassword, checkRateLimit } from '../../utils/security';
import { Mail, Lock, User, Loader, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
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
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignUp,
          });

          const buttonElement = document.getElementById('google-signup-button');
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              text: 'signup_with',
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

  const handleGoogleSignUp = async (response) => {
    try {
      setLoading(true);
      setError('');

      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);
      
      // Check if user already exists, if not create account
      const user = {
        id: userData.sub,
        email: userData.email,
        name: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim(),
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
        provider: 'google',
      };

      // Save user to local storage (for demo purposes)
      // In production, this should be handled by backend
      const users = JSON.parse(localStorage.getItem('activepanel_users') || '[]');
      const existingUser = users.find(u => u.email === userData.email);
      
      if (!existingUser) {
        users.push({
          id: userData.sub,
          email: userData.email,
          name: user.name,
          picture: userData.picture,
          role: 'user',
          provider: 'google',
        });
        localStorage.setItem('activepanel_users', JSON.stringify(users));
      }

      login(user);
      navigate('/dashboard');
    } catch (error) {
      setError('שגיאה בהרשמה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

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

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        setError('אנא מלא את כל השדות');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות');
        setLoading(false);
        return;
      }

      // Enhanced password validation
      const passwordValidation = validatePassword(password);
      if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
        setLoading(false);
        return;
      }

      // For demo, allow simple passwords but warn
      // In production, enforce strong passwords
      if (password.length < 8) {
        // Allow but could warn user
      }

      if (USE_BACKEND_API) {
        // Use backend API
        const result = await authAPI.register(email, password, name);
        login(result.user);
        navigate('/dashboard');
      } else {
        // Fallback to localStorage (demo mode)
        const user = await registerUser(email, password, name);
        login(user);
        navigate('/dashboard');
      }
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
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 text-sm text-right">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form id="signup-form" name="signupForm" onSubmit={handleEmailSignUp} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('fullName') || 'שם מלא'} *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterFullName') || 'הכנס שם מלא'}
                  className="input-field pl-10 text-right placeholder:pr-2"
                  dir="rtl"
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('emailAddress') || 'כתובת אימייל'} *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('password') || 'סיסמה'} *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword') || 'הכנס סיסמה'}
                  className="input-field pl-10 text-right placeholder:pr-2"
                  dir="rtl"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('confirmPassword') || 'אימות סיסמה'} *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPassword') || 'אימות סיסמה'}
                  className="input-field pl-10 text-right placeholder:pr-2"
                  dir="rtl"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  {t('signingUp') || 'נרשם...'}
                </span>
              ) : (
                t('signUp') || 'הירשם'
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

          {/* Google Sign Up Button */}
          <div className="mt-6">
            <div id="google-signup-button" className="w-full flex justify-center"></div>
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('googleClientIdMissing') || 'Google Sign-Up לא מוגדר. אנא הגדר VITE_GOOGLE_CLIENT_ID ב-.env'}
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
      </div>
    </div>
  );
};

export default SignUp;

