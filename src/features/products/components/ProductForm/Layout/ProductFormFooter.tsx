import React from 'react';
import { Button, Space, theme } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductFormFooterProps {
    isEditMode: boolean;
    isSaving: boolean;
    isUploading: boolean;
    productType?: string;
    onAddVariation: () => void;
}

export const ProductFormFooter: React.FC<ProductFormFooterProps> = ({
    isEditMode,
    isSaving,
    isUploading,
    productType,
    onAddVariation
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            padding: '16px 24px',
            background: token.colorBgContainer, // Use token
            borderTop: `1px solid ${token.colorBorderSecondary}`, // Use token
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'flex-end',
        }}>
            <Space>
                {productType === 'variable' && (
                    <Button
                        size="large"
                        onClick={onAddVariation}
                    >
                        {t('addSpecificVariation') || 'Add Variations'}
                    </Button>
                )}
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isEditMode ? isSaving : isUploading}
                    size="large"
                >
                    {isEditMode ? t('update') : (t('uploadProduct') || t('publish') || 'Upload Product')}
                </Button>
            </Space>
        </div>
    );
};
