import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';

const ConnectionStatus = () => {
  const { t, isRTL } = useLanguage();
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking', 'error'
  const [message, setMessage] = useState('');

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
  }, []);

  const checkConnection = async () => {
    const url = localStorage.getItem('woocommerce_url');
    const key = localStorage.getItem('consumer_key');
    const secret = localStorage.getItem('consumer_secret');

    if (!url || !key || !secret) {
      setStatus('disconnected');
      setMessage(t('notConfigured'));
      return;
    }

    try {
      setStatus('checking');
      await testConnection();
      setStatus('connected');
      setMessage(t('connected'));
    } catch (error) {
      setStatus('error');
      setMessage(t('connectionFailed'));
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi size={16} />;
      case 'disconnected':
      case 'error':
        return <WifiOff size={16} />;
      default:
        return <AlertCircle size={16} className="animate-pulse" />;
    }
  };

  return (
    <div
      className={`flex items-center flex-row-reverse space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor()}`}
      title={status === 'error' ? t('clickToCheck') : message}
      onClick={checkConnection}
      style={{ cursor: 'pointer' }}
    >
      {getIcon()}
      <span className="hidden md:inline">{message}</span>
    </div>
  );
};

export default ConnectionStatus;



