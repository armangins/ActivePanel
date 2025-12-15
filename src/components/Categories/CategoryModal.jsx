import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CloseOutlined as X, ReloadOutlined as Loader } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI } from '../../services/woocommerce';
import { Input } from '../ui/inputs';
import { Button, Modal } from '../ui';
import { categorySchema } from '../../schemas/category';
import DOMPurify from 'dompurify';
import { Select, Input as AntInput } from 'antd';
const { TextArea } = AntInput;

const CategoryModal = ({ category, onClose, isRTL, t }) => {
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const isEditMode = Boolean(category);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent: 0,
    }
  });

  useEffect(() => {
    loadParentCategories();
    if (category) {
      reset({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent: category.parent || 0,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        parent: 0,
      });
    }
  }, [category, reset]);

  const loadParentCategories = async () => {
    try {
      const data = await categoriesAPI.getAll({ per_page: 100 });
      // Filter out the current category from parent options if editing
      const filtered = category
        ? data.filter(cat => cat.id !== category.id)
        : data;
      setParentCategories(filtered);
    } catch (err) {
      // Failed to load categories
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const categoryData = {
        name: data.name.trim(),
        slug: data.slug?.trim() || undefined, // Let WooCommerce generate if empty
        description: data.description || '',
        parent: Number(data.parent) || 0,
      };

      if (isEditMode) {
        await categoriesAPI.update(category.id, categoryData);
      } else {
        await categoriesAPI.create(categoryData);
      }

      onClose();
    } catch (err) {
      setError('root', { message: err.message || t('error') || 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? (t('editCategory') || 'Edit Category') : (t('addCategory') || 'Add Category')}
      size="md"
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <Input
            {...register('name')}
            label={t('name') || 'Name'}
            placeholder={t('categoryNamePlaceholder') || 'הכנס שם קטגוריה'}
            error={errors.name?.message}
            required
            isRTL={isRTL}
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: 16 }}>
          <Input
            {...register('slug')}
            label={t('slug') || 'נתיב URL'}
            placeholder={t('categorySlugPlaceholder') || 'category-slug (אופציונלי)'}
            error={errors.slug?.message}
            isRTL={isRTL}
          />
          <p style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
            {t('slugHelpText') || 'Leave empty to auto-generate from name'}
          </p>
        </div>

        {/* Parent Category */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
            {t('parentCategory') || 'קטגוריית אב'}
          </label>
          <Select
            {...register('parent')}
            style={{ width: '100%' }}
            dir={isRTL ? 'rtl' : 'ltr'}
            defaultValue={0}
          >
            <Select.Option value={0}>{t('none') || 'ללא'}</Select.Option>
            {parentCategories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
            {t('description') || 'תיאור'}
          </label>
          <TextArea
            {...register('description')}
            placeholder={t('categoryDescriptionPlaceholder') || 'הכנס תיאור קטגוריה (HTML מותר)'}
            rows={4}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Error Message */}
        {errors.root && (
          <div style={{ padding: 16, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ color: '#d46b08', fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>{errors.root.message}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #f0f0f0', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            isLoading={saving}
          >
            {isEditMode ? (t('update') || 'Update') : (t('create') || 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
