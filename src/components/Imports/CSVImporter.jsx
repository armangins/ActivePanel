import { useState, useRef } from 'react';
import { ArrowUpTrayIcon, TableCellsIcon as FileSpreadsheet, CheckCircleIcon, ExclamationCircleIcon, MapIcon as Map } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import ColumnMapper from './ColumnMapper';
import { validateCSVData, transformToWooCommerce } from '../../utils/csvProcessor';

const CSVImporter = ({ mode = 'import', onValidation, onProductsGenerated }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [mappedData, setMappedData] = useState(null);
  const [columnMapping, setColumnMapping] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'mapping', 'preview'
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    try {
      let headers, rows;

      // Check file type
      if (uploadedFile.name.endsWith('.csv') || uploadedFile.type === 'text/csv') {
        // Parse CSV
        const text = await uploadedFile.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
          alert(t('emptyFile') || 'הקובץ ריק');
          return;
        }

        headers = parseCSVLine(lines[0]);
        rows = lines.slice(1).map(line => parseCSVLine(line));
      } else if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
        // For Excel files, show message to convert to CSV first
        // In production, you would use a library like xlsx or exceljs
        alert(t('excelNotSupported') || 'קבצי Excel לא נתמכים כרגע. אנא המר את הקובץ ל-CSV והעלה אותו שוב.');
        return;
      } else {
        alert(t('unsupportedFileType') || 'סוג קובץ לא נתמך. אנא העלה קובץ CSV.');
        return;
      }

      if (!headers || headers.length === 0) {
        alert(t('invalidFileFormat') || 'פורמט קובץ לא תקין');
        return;
      }

      setRawData({ headers, rows });
      setStep('mapping');
    } catch (error) {
      alert(t('errorReadingFile') || 'שגיאה בקריאת הקובץ: ' + error.message);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  const handleMappingComplete = (mapping) => {
    setColumnMapping(mapping);

    // Transform data
    const transformed = transformToWooCommerce(rawData.rows, rawData.headers, mapping, mode);
    setMappedData(transformed);

    // Validate
    const validation = validateCSVData(transformed, mode);
    onValidation(validation);

    setStep('preview');
  };

  const handleImport = async () => {
    if (!mappedData || mappedData.length === 0) {
      alert(t('noDataToImport') || 'אין נתונים לייבא');
      return;
    }

    try {
      if (mode === 'update') {
        // Update mode - update existing products
        const { productsAPI } = await import('../../services/woocommerce');
        let updated = 0;
        let errors = 0;

        for (const product of mappedData) {
          try {
            if (product.id) {
              await productsAPI.update(product.id, {
                regular_price: product.regular_price,
                sale_price: product.sale_price,
                stock_quantity: product.stock_quantity,
              });
              updated++;
            } else if (product.sku) {
              // Find product by SKU and update
              const products = await productsAPI.getAll({ per_page: 100 });
              const foundProduct = products.data.find(p => p.sku === product.sku);
              if (foundProduct) {
                await productsAPI.update(foundProduct.id, {
                  regular_price: product.regular_price,
                  sale_price: product.sale_price,
                  stock_quantity: product.stock_quantity,
                });
                updated++;
              } else {
                errors++;
              }
            }
          } catch (error) {
            errors++;
          }
        }

        alert(t('updateComplete') || `עודכנו ${updated} מוצרים. ${errors > 0 ? ` ${errors} שגיאות.` : ''}`);
        onProductsGenerated(mappedData);
      } else {
        // Import mode - create new products
        onProductsGenerated(mappedData);
      }
    } catch (error) {
      alert(t('importError') || 'שגיאה בייבא: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 flex-row-reverse">
        <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary-100' : 'bg-gray-100'}`}>
            <Upload className="w-[18px] h-[18px]" />
          </div>
          <span className="text-sm font-medium">{t('upload') || 'העלאה'}</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200"></div>
        <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-primary-600' : step === 'preview' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'mapping' || step === 'preview' ? 'bg-primary-100' : 'bg-gray-100'}`}>
            <Map className="w-[18px] h-[18px]" />
          </div>
          <span className="text-sm font-medium">{t('mapping') || 'מיפוי'}</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200"></div>
        <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-primary-100' : 'bg-gray-100'}`}>
            <CheckCircle className="w-[18px] h-[18px]" />
          </div>
          <span className="text-sm font-medium">{t('preview') || 'תצוגה מקדימה'}</span>
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="card">
          <div className="text-right py-12">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('uploadCSVFile') || 'העלה קובץ CSV או Excel'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('uploadCSVDescription') || 'בחר קובץ CSV או Excel עם נתוני מוצרים'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              className="flex items-center gap-2 mx-auto flex-row-reverse"
            >
              <ArrowUpTrayIcon className="w-[18px] h-[18px]" />
              {t('chooseFile') || 'בחר קובץ'}
            </Button>
            {file && (
              <p className="text-sm text-gray-600 mt-4">
                {t('selectedFile') || 'קובץ נבחר'}: {file.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && rawData && (
        <ColumnMapper
          headers={rawData.headers}
          sampleRows={rawData.rows.slice(0, 5)}
          mode={mode}
          onMappingComplete={handleMappingComplete}
        />
      )}

      {/* Preview Step */}
      {step === 'preview' && mappedData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
            {t('previewData') || 'תצוגה מקדימה של הנתונים'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('name') || 'שם'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('price') || 'מחיר'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('stock') || 'מלאי'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappedData.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {product.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {product.regular_price ? `₪${product.regular_price}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {product.sku || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {product.stock_quantity || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mappedData.length > 10 && (
              <p className="text-sm text-gray-600 mt-4 text-right">
                {t('showingFirst') || 'מציג'} 10 {t('of') || 'מתוך'} {mappedData.length} {t('products') || 'מוצרים'}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3 flex-row-reverse">
            <Button
              onClick={() => setStep('mapping')}
              variant="secondary"
            >
              {t('back') || 'חזור'}
            </Button>
            <Button
              onClick={handleImport}
              variant="primary"
            >
              {mode === 'update' ? (t('updateProducts') || 'עדכן מוצרים') : (t('importProducts') || 'ייבא מוצרים')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImporter;

