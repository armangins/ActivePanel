import { Form, Button, Space, Spin, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useProductForm } from '../../hooks/useProductForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { GeneralTab } from './GeneralTab';

export const ProductForm = () => {
    const { id } = useParams();
    const productId = id ? parseInt(id) : null;
    const { t } = useLanguage();
    const navigate = useNavigate();



    const {
        form: { control, formState: { errors } },
        form,
        isLoading,
        isSaving,
        onSubmit: handleSave,
        isEditMode,
        handleGenerateSKU
    } = useProductForm(productId);

    const { data: categories = [] } = useCategories();


    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }



    const handleFormSubmit = () => {
        form.handleSubmit(handleSave)();
    };

    const formContent = (
        <GeneralTab
            control={control}
            errors={errors}
            categories={categories}
            handleGenerateSKU={handleGenerateSKU}
            setValue={form.setValue}
        />
    );



    return (
        <Form layout="vertical" onFinish={handleFormSubmit} style={{ paddingBottom: 80 }}>
            {/* Header - Just Title and Back */}
            <div style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
                        {t('back') || "Back"}
                    </Button>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {isEditMode ? t('editProduct') : t('createProduct')}
                    </Typography.Title>
                </Space>
            </div>

            {/* Form Content */}
            {formContent}

            {/* Sticky Actions Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 999,
                padding: '16px 24px',
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={isSaving} icon={<SaveOutlined />} size="large">
                        {isEditMode ? t('update') : (t('uploadProduct') || t('publish') || 'Upload Product')}
                    </Button>
                </Space>
            </div>
        </Form>
    );
};
