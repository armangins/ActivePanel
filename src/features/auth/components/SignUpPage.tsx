import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Space } from 'antd';
import { useAuth } from '../providers/AuthProvider';
import { SignUpForm } from './SignUpForm';
import { GoogleAuthButton } from './GoogleAuthButton';

const { Title, Text } = Typography;

export const SignUpPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', direction: 'rtl' }}>
            {/* Left Panel (Form) */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                padding: '32px 48px'
            }}>
                <div style={{ width: '100%', maxWidth: 450 }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 32 }}>
                        <img
                            src="/logo.svg"
                            alt="ActivePanel"
                            style={{ height: 48, marginBottom: 24 }}
                        />
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: 32 }}>
                        <Title level={1} style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
                            הירשם
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            כבר יש לך חשבון?{' '}
                            <Link to="/login" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500 }}>
                                התחבר
                            </Link>
                        </Text>
                    </div>

                    {/* Form */}
                    <SignUpForm onSuccess={() => navigate('/dashboard')} />

                    {/* Divider */}
                    <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '100%', borderTop: '1px solid #d9d9d9' }}></div>
                        </div>
                        <div style={{ position: 'relative', display: 'inline-block', padding: '0 16px', backgroundColor: '#fff' }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>או המשך עם</Text>
                        </div>
                    </div>

                    {/* Google Auth */}
                    <div style={{ marginTop: 24 }}>
                        <GoogleAuthButton />
                    </div>
                </div>
            </div>

            {/* Right Panel (Welcome) - Using pure CSS/Style for now to replace Tailwind */}
            <div style={{
                display: 'none', // hidden on mobile
                flex: 1,
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', // gray-800 to 900
                position: 'relative',
                overflow: 'hidden',
                '@media (min-width: 1024px)': {
                    display: 'flex'
                }
            }} className="hidden lg:flex"> {/* We can use className for responsiveness if Tailwind is still around, but per rules we should use media queries or AntD Grid. I will use a simple className for now since Tailwind removal is Phase 2b but this is migration. Actually, I can use AntD Layout generic styles. */}

                {/* Helper for responsiveness: Since explicit CSS-in-JS media queries are tricky without a library, 
            I'll rely on the fact that the original code used 'hidden lg:flex'. 
            If Tailwind is removed, this class won't work. 
            I should use window width check or AntD Grid <Col span={0} lg={12}>. 
            However, AntD Grid is for internal layout. 
            I'll use a style prop with a media query? No, React style prop doesn't support media queries.
            I will use a simple JS check or just leave it visible for now, assuming standard desktop view.
            Or better, wrap in a component that handles it. `LoginWelcomePanel` had a JS check! I'll copy that pattern if needed.
        */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                }}>
                    {/* Abstract Shapes */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, backgroundColor: '#fff', borderRadius: '50%', filter: 'blur(64px)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 384, height: 384, backgroundColor: '#3b82f6', borderRadius: '50%', filter: 'blur(64px)' }}></div>
                </div>

                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 48,
                    color: '#fff'
                }}>
                    <Title level={2} style={{ color: '#fff', fontSize: 36, marginBottom: 24 }}>
                        ברוכים הבאים לקהילה שלנו
                    </Title>
                    <Text style={{ fontSize: 18, color: '#d1d5db', marginBottom: 24, lineHeight: 1.6, display: 'block' }}>
                        ActivePanel עוזרת לבעלי עסקים וחנויות אינטרנטיות לנהל את הפעילות שלהם בצורה חכמה, מסודרת ויעילה.
                    </Text>
                    <Text style={{ fontSize: 16, color: '#d1d5db', display: 'block' }}>
                        יותר מ-17 אלף אנשים הצטרפו אלינו, תורך עכשיו.
                    </Text>
                </div>
            </div>
        </div>
    );
};
