import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Space } from 'antd';
import { useAuth } from '../providers/AuthProvider';
import { LoginForm } from './LoginForm';
import { LoginWelcomePanel } from './LoginWelcomePanel';
import { GoogleAuthButton } from './GoogleAuthButton';

const { Title, Text } = Typography;

export const LoginPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', direction: 'ltr' }}>
            {/* Right Panel (Welcome) - Using the component we migrated */}
            <LoginWelcomePanel />

            {/* Left Panel (Form) */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                padding: '40px 24px'
            }}>
                <div style={{ width: '100%', maxWidth: 450 }}>

                    {/* Sign In Title */}
                    <div style={{ marginBottom: 32, textAlign: 'right' }}>
                        <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
                            התחברות
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            התחברו והתחילו לנהל את החנות שלכם
                        </Text>
                    </div>

                    {/* Social Login Buttons */}
                    <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 32 }}>
                        <GoogleAuthButton />
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

                    {/* Login Form */}
                    <LoginForm onSuccess={() => navigate('/dashboard')} />

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
        </div>
    );
};
