import React from 'react';
import { Button, Space } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLayoutStyles } from './styles';

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
    const { footerStyle } = useLayoutStyles();

    return (
        <div style={footerStyle}>
            <Space>
                {productType === 'variable' && (
                    <Button
                        size="large"
                        onClick={onAddVariation}
                    >
                        {t('addSpecificVariation')}
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
