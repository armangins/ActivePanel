import { useState, useEffect, useCallback } from 'react';
import {
  SignalIcon as Wifi,
  SignalSlashIcon as WifiOff,
  ExclamationCircleIcon as AlertCircle
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection, hasWooCommerceConfig } from '../../services/woocommerce';

const ConnectionStatus = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking', 'error'
  const [message, setMessage] = useState('');

  const checkConnection = useCallback(async () => {
    if (!hasWooCommerceConfig()) {
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

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4 animate-pulse" />;
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



