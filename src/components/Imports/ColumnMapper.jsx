import { useState, useEffect } from 'react';
import { CheckCircleOutlined as CheckCircleIcon, ExclamationCircleOutlined as ExclamationCircleIcon } from '@ant-design/icons';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';

const ColumnMapper = ({ headers, sampleRows, mode, onMappingComplete }) => {
  const { t } = useLanguage();

  // WooCommerce required/optional fields
  const wooCommerceFields = [
    { key: 'name', label: t('productName') || 'שם מוצר', required: true },
    { key: 'sku', label: 'SKU', required: mode === 'update' },
    { key: 'id', label: 'ID', required: mode === 'update' },
    { key: 'regular_price', label: t('regularPrice') || 'מחיר רגיל', required: false },
    { key: 'sale_price', label: t('salePrice') || 'מחיר מבצע', required: false },
    { key: 'stock_quantity', label: t('stockQuantity') || 'כמות במלאי', required: false },
    { key: 'description', label: t('description') || 'תיאור', required: false },
    { key: 'short_description', label: t('shortDescription') || 'תיאור קצר', required: false },
    { key: 'categories', label: t('categories') || 'קטגוריות', required: false },
    { key: 'tags', label: t('tags') || 'תגיות', required: false },
    { key: 'images', label: t('images') || 'תמונות', required: false },
  ];

  const [mapping, setMapping] = useState({});
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    // Auto-detect column mappings
    const autoMapping = {};

    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase().trim();

      // Try to match common patterns
      wooCommerceFields.forEach(field => {
        const fieldLower = field.key.toLowerCase();
        const fieldLabelLower = field.label.toLowerCase();

        if (
          headerLower.includes(fieldLower) ||
          headerLower === fieldLabelLower ||
          headerLower.includes(fieldLabelLower) ||
          (fieldLower === 'name' && (headerLower.includes('שם') || headerLower.includes('product'))) ||
          (fieldLower === 'regular_price' && (headerLower.includes('מחיר') || headerLower.includes('price'))) ||
          (fieldLower === 'stock_quantity' && (headerLower.includes('מלאי') || headerLower.includes('stock'))) ||
          (fieldLower === 'sku' && headerLower === 'sku')
        ) {
          autoMapping[field.key] = index;
        }
      });
    });

    setMapping(autoMapping);
    setAutoDetected(true);
  }, [headers]);

  const updateMapping = (fieldKey, columnIndex) => {
    setMapping({ ...mapping, [fieldKey]: columnIndex === '' ? undefined : parseInt(columnIndex) });
  };

  const handleComplete = () => {
    // Validate required fields
    const requiredFields = wooCommerceFields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => mapping[f.key] === undefined);

    if (missingFields.length > 0) {
      alert(t('missingRequiredFields') || 'חסרים שדות חובה: ' + missingFields.map(f => f.label).join(', '));
      return;
    }

    onMappingComplete(mapping);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
        {t('mapColumns') || 'מפה עמודות'}
      </h3>
      <p className="text-gray-600 mb-6 text-right">
        {t('mapColumnsDescription') || 'בחר איזה עמודה בקובץ שלך מתאימה לכל שדה ב-WooCommerce'}
      </p>

      {/* Sample Data Preview */}
      <div className="mb-6 overflow-x-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2 text-right">
          {t('sampleData') || 'נתונים לדוגמה:'}
        </h4>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sampleRows.slice(0, 3).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-right text-gray-900">
                    {cell || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mapping Form */}
      <div className="space-y-4">
        {wooCommerceFields.map((field) => {
          const mappedColumn = mapping[field.key];
          const isRequired = field.required;

          return (
            <div key={field.key} className="flex items-center gap-4 flex-row-reverse">
              <div className="flex-1 text-right">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {isRequired && <span className="text-orange-500 mr-1">*</span>}
                </label>
              </div>
              <div className="flex-1">
                <select
                  value={mappedColumn !== undefined ? mappedColumn : ''}
                  onChange={(e) => updateMapping(field.key, e.target.value)}
                  className={`input-field ${isRequired && mappedColumn === undefined ? 'border-orange-300' : ''}`}
                >
                  <option value="">{t('notMapped') || 'לא ממופה'}</option>
                  {headers.map((header, index) => (
                    <option key={index} value={index}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-6">
                {mappedColumn !== undefined && (
                  <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                )}
                {isRequired && mappedColumn === undefined && (
                  <ExclamationCircleIcon className="w-[18px] h-[18px] text-orange-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end flex-row-reverse">
        <Button
          onClick={handleComplete}
          variant="primary"
        >
          {t('continue') || 'המשך'}
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;













