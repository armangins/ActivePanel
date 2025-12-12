import { useState } from 'react';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';
import { useCreateVariation, useUpdateVariation } from '../../../hooks/useVariations';
import { secureLog } from '../../../utils/logger';

/**
 * VariationForm Component
 * 
 * Form for creating or editing a product variation.
 * 
 * @param {Number} productId - Product ID
 * @param {Object} variation - Variation object (for editing, null for creating)
 * @param {Array} attributes - Product attributes (e.g., [{id: 1, name: 'Size', options: ['S', 'M', 'L']}])
 * @param {Function} t - Translation function
 * @param {Function} onSuccess - Callback when save is successful
 * @param {Function} onCancel - Callback when cancel is clicked
 */
const VariationForm = ({
    productId,
    variation = null,
    attributes = [],
    t,
    onSuccess,
    onCancel
}) => {
    const isEditing = !!variation;

    // Form state
    const [formData, setFormData] = useState({
        sku: variation?.sku || '',
        regular_price: variation?.regular_price || '',
        sale_price: variation?.sale_price || '',
        stock_quantity: variation?.stock_quantity || '',
        stock_status: variation?.stock_status || 'instock',
        attributes: variation?.attributes || attributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            option: ''
        }))
    });

    // Mutations
    const createMutation = useCreateVariation();
    const updateMutation = useUpdateVariation();

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (attrId, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map(attr =>
                attr.id === attrId ? { ...attr, option: value } : attr
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate attributes
        const missingAttributes = formData.attributes.filter(attr => !attr.option);
        if (missingAttributes.length > 0) {
            alert(t('pleaseSelectAllAttributes') || 'Please select all attributes');
            return;
        }

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({
                    productId,
                    variationId: variation.id,
                    data: formData
                });
            } else {
                await createMutation.mutateAsync({
                    productId,
                    data: formData
                });
            }
            onSuccess?.();
        } catch (err) {
            secureLog.error('Save variation error:', err);
            alert(`${t('error') || 'Error'}: ${err.message || 'Failed to save variation'}`);
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Attributes Selection */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 text-right">
                    {t('attributes') || 'Attributes'}
                </h4>
                {attributes.map(attr => (
                    <div key={attr.id}>
                        <label className="block text-sm text-gray-600 mb-1 text-right">
                            {attr.name}
                        </label>
                        <select
                            value={formData.attributes.find(a => a.id === attr.id)?.option || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                            required
                            dir="rtl"
                        >
                            <option value="">{t('select') || 'Select...'}</option>
                            {attr.options?.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {/* SKU */}
            <Input
                label={t('sku') || 'SKU'}
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder={t('enterSKU') || 'Enter SKU'}
                dir="ltr"
                className="text-left"
            />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={t('regularPrice') || 'Regular Price'}
                    type="number"
                    step="0.01"
                    value={formData.regular_price}
                    onChange={(e) => handleChange('regular_price', e.target.value)}
                    placeholder="0.00"
                    dir="ltr"
                    className="text-left"
                    required
                />
                <Input
                    label={t('salePrice') || 'Sale Price'}
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => handleChange('sale_price', e.target.value)}
                    placeholder="0.00"
                    dir="ltr"
                    className="text-left"
                />
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={t('stockQuantity') || 'Stock Quantity'}
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    dir="ltr"
                    className="text-left"
                />
                <div>
                    <label className="block text-sm text-gray-600 mb-1 text-right">
                        {t('stockStatus') || 'Stock Status'}
                    </label>
                    <select
                        value={formData.stock_status}
                        onChange={(e) => handleChange('stock_status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                        dir="rtl"
                    >
                        <option value="instock">{t('inStock') || 'In Stock'}</option>
                        <option value="outofstock">{t('outOfStock') || 'Out of Stock'}</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    {t('cancel') || 'Cancel'}
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                >
                    {isLoading
                        ? (t('saving') || 'Saving...')
                        : (isEditing ? (t('update') || 'Update') : (t('create') || 'Create'))
                    }
                </Button>
            </div>
        </form>
    );
};

export default VariationForm;
