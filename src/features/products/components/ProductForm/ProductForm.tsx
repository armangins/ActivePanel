import { Form, Button, Tabs, Space, Spin, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useWatch } from 'react-hook-form';
import { useProductForm } from '../../hooks/useProductForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { GeneralTab } from './GeneralTab';
import { InventoryTab } from './InventoryTab';
import { ShippingTab } from './ShippingTab';
import { AttributesTab, VariationsTab } from './ProductTabs';

export const ProductForm = () => {
    const { id } = useParams();
    const productId = id ? parseInt(id) : null;
    const { t } = useLanguage();
    const navigate = useNavigate();

    const {
        form: { control, formState: { errors } },
        isLoading,
        isSaving,
        onSubmit,
        isEditMode,
        handleGenerateSKU
    } = useProductForm(productId);

    const { data: categories = [] } = useCategories();
    const attributes = useWatch({ control, name: 'attributes' }) || [];
    const productType = useWatch({ control, name: 'type' });

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    const items = [
        {
            key: 'general',
            label: t('general'),
            children: <GeneralTab control={control} errors={errors} categories={categories} />
        },
        {
            key: 'inventory',
            label: t('inventory'),
            children: <InventoryTab control={control} handleGenerateSKU={handleGenerateSKU} />
        },
        {
            key: 'shipping',
            label: t('shipping'),
            children: <ShippingTab control={control} />
        },
        {
            key: 'attributes',
            label: t('attributes'),
            children: <AttributesTab attributes={attributes} />
        },
        {
            key: 'variations',
            label: t('variations'),
            children: <VariationsTab productId={productId} productType={productType} attributes={attributes} />
        },
    ];

    return (
        <Form layout="vertical" onFinish={onSubmit}>
            <div style={{
                marginBottom: 24,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Space wrap>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
                        {t('back')}
                    </Button>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {isEditMode ? t('editProduct') : t('createProduct')}
                    </Typography.Title>
                </Space>
                <Space wrap>
                    <Button type="primary" htmlType="submit" loading={isSaving} icon={<SaveOutlined />}>
                        {isEditMode ? t('update') : t('publish')}
                    </Button>
                </Space>
            </div>

            <Tabs defaultActiveKey="general" items={items} />
        </Form>
    );
};
