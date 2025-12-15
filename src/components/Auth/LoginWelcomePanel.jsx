import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { MoonOutlined } from '@ant-design/icons';
import { Button } from '../ui';

const { Title, Text } = Typography;

/**
 * Login Welcome Panel Component
 * 
 * Displays welcome message and branding on the login page.
 * Only visible on large screens.
 */
const LoginWelcomePanel = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isLargeScreen) return null;

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: '48px',
        color: '#fff',
        width: 'fit-content',
        textAlign: 'right'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 48 }}>
          <div style={{
            display: 'flex',
            gap: 4,
            alignItems: 'flex-end'
          }}>
            <div style={{ width: 4, height: 12, backgroundColor: '#fff', borderRadius: 2 }}></div>
            <div style={{ width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 }}></div>
            <div style={{ width: 4, height: 24, backgroundColor: '#fff', borderRadius: 2 }}></div>
          </div>
          <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 24, fontWeight: 700 }}>
            Active Panel
          </Title>
        </div>

        {/* Description */}
        <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
        Active Panel
      פלטפורמת ניהול החנויות המובילה, הצטרפו למאות עסקים שכבר בחרו נכון 
             </Text>

        {/* Dark Mode Toggle */}
        <div style={{ position: 'absolute', bottom: 24, right: 24 }}>
          <Button
            type="text"
            icon={<MoonOutlined style={{ color: '#fff' }} />}
            style={{ color: '#fff' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginWelcomePanel;











