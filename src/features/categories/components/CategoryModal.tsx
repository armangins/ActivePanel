import { Modal, Form, Input, Select, Button } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '../types';
import { useCategoryForm } from '../hooks/useCategoryForm';
import { useCategoriesList } from '../hooks/useCategoriesData';

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    category?: Category | null;
}

const CategoryModal = ({ open, onClose, category }: CategoryModalProps) => {
    const { t, isRTL } = useLanguage();
    const { form, isLoading, onSubmit, isEditMode } = useCategoryForm(category, onClose);
    const { data: categories = [] } = useCategoriesList();

    // Filter parents to avoid self-reference or circular deps (basic)
    const parentOptions = categories
        .filter((c: Category) => !category || c.id !== category.id)
        .map((c: Category) => ({
            label: c.name,
            value: c.id
        }));

    return (
        <Modal
            title={isEditMode ? (t('editCategory') || 'Edit Category') : (t('addCategory') || 'Add New Category')}
            open={open}
            onCancel={onClose}
            maskClosable={false}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('cancel') || 'Cancel'}
                </Button>,
                <Button key="submit" type="primary" loading={isLoading} onClick={onSubmit}>
                    {isEditMode ? (t('update') || 'Update') : (t('save') || 'Save')}
                </Button>
            ]}
        >
            <Form // Standard Ant Design Form Layout with React Hook Form Controller
                layout="vertical"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>{t('name') || 'Name'}</label>
                    <Input
                        value={form.watch('name')}
                        onChange={(e) => form.setValue('name', e.target.value)}
                        status={form.formState.errors.name ? 'error' : ''}
                    />
                    {form.formState.errors.name && <div style={{ color: '#ff4d4f' }}>{form.formState.errors.name.message}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>{t('slug') || 'Slug'}</label>
                    <Input
                        value={form.watch('slug')}
                        onChange={(e) => form.setValue('slug', e.target.value)}
                        placeholder="Optional"
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>{t('parentCategory') || 'Parent Category'}</label>
                    <Select
                        style={{ width: '100%' }}
                        value={form.watch('parent')}
                        onChange={(val) => form.setValue('parent', val)}
                        options={[{ label: t('none') || 'None', value: 0 }, ...parentOptions]}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>{t('description') || 'Description'}</label>
                    <Input.TextArea
                        rows={4}
                        value={form.watch('description')}
                        onChange={(e) => form.setValue('description', e.target.value)}
                    />
                </div>
            </Form>
        </Modal>
    );
};

export default CategoryModal;
