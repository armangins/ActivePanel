import React from 'react';
import { Button } from 'antd';
import { SaveOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/features/products/types';
import { theme } from 'antd';

interface ProductDetailFooterProps {
    onClose: () => void;
    onSave: () => void;
    isSaving: boolean;
    product?: Product;
    fullProduct?: Product;
}

export const ProductDetailFooter: React.FC<ProductDetailFooterProps> = ({
    onClose,
    onSave,
    isSaving,
    product,
    fullProduct
}) => {
    const { t } = useLanguage();
    const { useToken } = theme;
    const { token } = useToken();

    const permalink = fullProduct?.permalink || product?.permalink;

    return (
        <div style={{
            padding: '16px 24px',
            background: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
        }}>
            <Button
                icon={<CloseOutlined />}
                onClick={onClose}
            >
                {t('cancel')}
            </Button>
            {permalink && (
                <Button
                    icon={<GlobalOutlined />}
                    href={permalink}
                    target="_blank"
                >
                    {t('viewOnSite')}
                </Button>
            )}
            <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={onSave}
                loading={isSaving}
            >
                {t('saveChanges')}
            </Button>
        </div>
    );
};
