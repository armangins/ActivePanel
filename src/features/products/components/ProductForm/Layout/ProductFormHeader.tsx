import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';


interface ProductFormHeaderProps {
    isEditMode: boolean;
    onNavigateBack: () => void;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({ isEditMode, onNavigateBack }) => {
    const { t } = useLanguage();

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Space align="center">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onNavigateBack}
                />
                <Typography.Title level={2} style={{ margin: 0 }}>
                    {isEditMode ? t('editProduct') : t('createProduct')}
                </Typography.Title>
            </Space>
        </div>
    );
};
