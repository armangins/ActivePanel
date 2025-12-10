import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * TaxFields Component
 * 
 * Collapsible tax configuration fields for products
 */
const TaxFields = ({ formData, onChange }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const taxStatusOptions = [
        { value: 'taxable', label: t('taxable') || 'חייב במס' },
        { value: 'shipping', label: t('shippingOnly') || 'משלוח בלבד' },
        { value: 'none', label: t('noTax') || 'ללא מס' }
    ];

    const taxClassOptions = [
        { value: '', label: t('standard') || 'סטנדרט' },
        { value: 'reduced-rate', label: t('reducedRate') || 'תעריף מופחת' },
        { value: 'zero-rate', label: t('zeroRate') || 'תעריף אפס' }
    ];

    return (
        <div className="space-y-4">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-right"
            >
                <span className="text-sm font-medium text-gray-700">
                    {t('taxation') || 'מיסוי'}
                </span>
                {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {/* Collapsible Tax Fields */}
            {isExpanded && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Tax Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                            {t('taxStatus') || 'סטטוס מס'}
                        </label>
                        <select
                            value={formData.tax_status || 'taxable'}
                            onChange={(e) => onChange('tax_status', e.target.value)}
                            className="input-field text-right w-full"
                            dir="rtl"
                        >
                            {taxStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tax Class */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                            {t('taxClass') || 'סוג מס'}
                        </label>
                        <select
                            value={formData.tax_class || ''}
                            onChange={(e) => onChange('tax_class', e.target.value)}
                            className="input-field text-right w-full"
                            dir="rtl"
                        >
                            {taxClassOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxFields;
