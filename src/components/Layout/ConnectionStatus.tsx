import React, { useState, useEffect, useCallback } from 'react';
import {
    WifiOutlined as Wifi,
    DisconnectOutlined as WifiOff,
    ExclamationCircleOutlined as AlertCircle
} from '@ant-design/icons';
import { theme } from 'antd';
import { useLanguage } from '../../contexts/LanguageContext';
import { testConnection } from '../../services/woocommerce';

type ConnectionStatusType = 'checking' | 'connected' | 'disconnected' | 'error';

interface StatusConfig {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

/**
 * ConnectionStatus Component
 * 
 * Displays the current connection status to the backend/WooCommerce API.
 * Automatically checks connection periodically and updates status.
 */
const ConnectionStatus: React.FC = () => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const [status, setStatus] = useState<ConnectionStatusType>('checking');
    const [message, setMessage] = useState<string>('');

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

    const getStatusConfig = (): StatusConfig => {
        switch (status) {
            case 'connected':
                return { color: token.colorSuccess, bgColor: token.colorSuccessBg, icon: <Wifi /> };
            case 'disconnected':
                return { color: token.colorTextDisabled, bgColor: token.colorFillQuaternary, icon: <WifiOff /> };
            case 'error':
                return { color: token.colorError, bgColor: token.colorErrorBg, icon: <WifiOff /> };
            default:
                return { color: token.colorWarning, bgColor: token.colorWarningBg, icon: <AlertCircle /> };
        }
    };

    const config = getStatusConfig();
    const showMessage = window.innerWidth >= 768;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: token.borderRadius,
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
            {showMessage && <span>{message}</span>}
        </div>
    );
};

export default ConnectionStatus;
