import { useState, useEffect, useCallback } from 'react';
import {
  WifiOutlined as Wifi,
  DisconnectOutlined as WifiOff,
  ExclamationCircleOutlined as AlertCircle
} from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';

const ConnectionStatus = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking', 'error'
  const [message, setMessage] = useState('');

  const checkConnection = useCallback(async () => {
    try {
      setStatus('checking');
      await testConnection();
      setStatus('connected');
      setMessage(t('connected'));
    } catch (error) {
      setStatus('error');
      setMessage(t('connectionFailed'));
    }
  }, [t]);

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      checkConnection();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, [checkConnection]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { color: '#52c41a', bgColor: '#f6ffed', icon: <Wifi /> };
      case 'disconnected':
        return { color: '#8c8c8c', bgColor: '#fafafa', icon: <WifiOff /> };
      case 'error':
        return { color: '#ff4d4f', bgColor: '#fff2f0', icon: <WifiOff /> };
      default:
        return { color: '#faad14', bgColor: '#fffbe6', icon: <AlertCircle /> };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        color: config.color,
        backgroundColor: config.bgColor,
        cursor: 'pointer',
        flexDirection: 'row-reverse'
      }}
      title={status === 'error' ? t('clickToCheck') : message}
      onClick={checkConnection}
    >
      {config.icon}
      <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>{message}</span>
    </div>
  );
};

export default ConnectionStatus;



