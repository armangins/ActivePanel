import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon as X, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI } from '../../services/woocommerce';
import { Input } from '../ui/inputs';
import { Button } from '../ui';
import { categorySchema } from '../../schemas/category';
import DOMPurify from 'dompurify';

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white sm:rounded-lg max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? (t('editCategory') || 'Edit Category') : (t('addCategory') || 'Add Category')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
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
          <div>
            <Input
              {...register('slug')}
              label={t('slug') || 'נתיב URL'}
              placeholder={t('categorySlugPlaceholder') || 'category-slug (אופציונלי)'}
              error={errors.slug?.message}
              isRTL={isRTL}
            />
            <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('slugHelpText') || 'Leave empty to auto-generate from name'}
            </p>
          </div>

          {/* Parent Category */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('parentCategory') || 'קטגוריית אב'}
            </label>
            <select
              {...register('parent')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value={0}>{t('none') || 'ללא'}</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('description') || 'תיאור'}
            </label>
            <textarea
              {...register('description')}
              placeholder={t('categoryDescriptionPlaceholder') || 'הכנס תיאור קטגוריה (HTML מותר)'}
              rows={4}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className={`text-orange-800 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{errors.root.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-3 pt-4 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className="px-6"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{t('saving') || 'Saving...'}</span>
                </>
              ) : (
                <span>{isEditMode ? (t('update') || 'Update') : (t('create') || 'Create')}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
