import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { authAPI } from '../../services/api';
import { Alert, Checkbox, Space, Typography } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuthErrorHandler } from '../../hooks/useAuthErrorHandler';

import { validateLoginForm, checkLoginRateLimit, authenticateUser, recordFailedLoginAttempt, clearFailedLoginAttempts } from '../../utils/loginHelpers';
import {
  MailOutlined as Mail,
  LockOutlined as Lock,
  ReloadOutlined as Loader
} from '@ant-design/icons';
import { Input } from '../ui/inputs';
import { Button } from '../ui';
import LoginWelcomePanel from './LoginWelcomePanel';
import { GoogleAuthButton } from './GoogleAuthButton';

const { Text, Title } = Typography;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { error, setError, clearError } = useAuthErrorHandler();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    // This handles cases where user navigates to /login while already logged in
    // OAuth flow is handled by OAuthCallback component, not here
    if (isAuthenticated && !error) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, error]);


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

      const { user, accessToken } = await authenticateUser(email, password);

      // Clear failed login attempts on success
      clearFailedLoginAttempts(email);

      // SECURITY: Clear password from memory immediately after use
      setPassword('');
      // Clear password reference to help garbage collection
      const tempPassword = password;
      if (tempPassword) {
        // Attempt to overwrite (best effort - JavaScript doesn't guarantee memory clearing)
        tempPassword.replace(/./g, '');
      }

      // Login with JWT - pass user data and access token
      login(user, accessToken);

      navigate('/dashboard');
    } catch (err) {
      // Record failed login attempt for rate limiting
      recordFailedLoginAttempt(email);
      setError(err.message || 'שגיאה בהתחברות. אנא נסה שוב.');
      // Clear password on error as well
      setPassword('');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', direction: 'ltr' }}>
          <LoginWelcomePanel />
      {/* Left Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 450 }}>
          {/* Back to dashboard link */}


          {/* Sign In Title */}
          <div style={{ marginBottom: 32, textAlign: 'right' }}>
            <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
           התחברות
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
            התחברו והתחילו לנהל את החנות שלכם            </Text>
          </div>

          {/* Social Login Buttons */}
          <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 32 }}>
            <Button
              type="default"
              block
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              }
              style={{ 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #d9d9d9'
              }}
              onClick={() => window.location.href = '/api/auth/google'}
            >
              התבחרו עם Google
            </Button>
          </Space>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #d9d9d9' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'inline-block', padding: '0 16px', backgroundColor: '#fff' }}>
              <Text type="secondary" style={{ fontSize: 14 }}>או דרך</Text>
            </div>
          </div>

          {/* Info message if user just signed up but ended up here */}
          {!error && window.location.search.includes('signup') && (
            <Alert
              message={t('signupCompleted') || 'ההרשמה הושלמה בהצלחה!'}
              description={t('pleaseSignIn') || 'כעת תוכל להתחבר עם Google או עם אימייל וסיסמה.'}
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Error Message */}
          {error && (
            <Alert
              message={error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
              description={
                <>
                  {(error.includes('already exists') || error.includes('User already exists')) && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #ffccc7' }}>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                        {t('accountExists') || 'החשבון כבר קיים'}
                      </Text>
                      <GoogleAuthButton />
                    </div>
                  )}
                  {error.includes('Account exists but was not created with Google') && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #ffccc7' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('useEmailPassword') || 'אנא השתמש בהתחברות עם אימייל וסיסמה'}
                      </Text>
                    </div>
                  )}
                </>
              }
            />
          )}

          {/* Login Form */}
          <form id="login-form" name="loginForm" onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Email Field */}
            <Input
              id="login-email"
              name="email"
              type="email"
              label="מייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@gmail.com"
              leftIcon={Mail}
              required
              disabled={loading}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {/* Password Field */}
            <Input
              id="login-password"
              name="password"
              type="password"
              label="סיסמא"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הזינו סיסמא"
              leftIcon={Lock}
              required
              disabled={loading}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
            />

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
               תזכרו אותי בבקשה
              </Checkbox>
              <a href="#" style={{ fontSize: 14, color: '#1890ff', textDecoration: 'none' }}>
               ? שחכתם סיסמא
              </a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              icon={loading ? <Loader spin /> : null}
              block
              style={{ height: 48, fontSize: 16, fontWeight: 500 }}
            >
              {loading ? 'מאמתים אתכם, זה יקח רק עוד רגע...' : 'התחברות'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500 }}>
                Sign Up
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Panel - Welcome Message */}
  
    </div>
  );
};

export default Login;
