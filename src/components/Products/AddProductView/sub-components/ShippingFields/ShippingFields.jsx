import { Input } from '../../../../ui/inputs';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const ShippingFields = ({ formData, onWeightChange, onDimensionsChange, onShippingClassChange, onRequiresShippingChange }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-4 pt-4 border-t border-gray-100" dir="rtl">
            <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 text-right whitespace-nowrap">{t('shipping') || 'משלוח'}</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.requires_shipping !== false}
                        onChange={(e) => onRequiresShippingChange(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">{t('thisProductRequiresShipping') || 'מוצר זה דורש משלוח'}</span>
                </label>
            </div>

            {(formData.requires_shipping !== false) && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('weight') || 'משקל (ק"ג)'}
                            type="number"
                            value={formData.weight || ''}
                            onChange={(e) => onWeightChange(e.target.value)}
                            placeholder="0.0"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Input
                            label={t('length') || 'אורך'}
                            type="number"
                            value={formData.dimensions?.length || ''}
                            onChange={(e) => onDimensionsChange({ ...formData.dimensions, length: e.target.value })}
                            placeholder="0"
                            min="0"
                        />
                        <Input
                            label={t('width') || 'רוחב'}
                            type="number"
                            value={formData.dimensions?.width || ''}
                            onChange={(e) => onDimensionsChange({ ...formData.dimensions, width: e.target.value })}
                            placeholder="0"
                            min="0"
                        />
                        <Input
                            label={t('height') || 'גובה'}
                            type="number"
                            value={formData.dimensions?.height || ''}
                            onChange={(e) => onDimensionsChange({ ...formData.dimensions, height: e.target.value })}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ShippingFields;
