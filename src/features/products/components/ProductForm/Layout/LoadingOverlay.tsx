import React from 'react';
import { Spin, Typography, theme } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingOverlayProps {
    isUploading: boolean;
    progress: number;
    currentStep?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isUploading, progress, currentStep }) => {
    const { t } = useLanguage();

    if (!isUploading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Spin size="large" />
            <Typography.Title level={4} style={{ marginTop: 16 }}>
                {t('uploadingProduct')}...
            </Typography.Title>
            <Typography.Text type="secondary">
                {progress}% - {currentStep}
            </Typography.Text>
        </div>
    );
};
