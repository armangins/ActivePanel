import { useState } from 'react';
import { ArrowUpTrayIcon, TableCellsIcon as FileSpreadsheet, CheckCircleIcon, ExclamationCircleIcon, ArrowDownTrayIcon as Download, PlusIcon as Plus, ArrowPathIcon as RefreshCw } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductBuilder from './ProductBuilder';
import CSVImporter from './CSVImporter';
import ValidationResults from './ValidationResults';
import ExportPanel from './ExportPanel';

const Imports = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('builder'); // 'builder', 'csv', 'update'
  const [validationResults, setValidationResults] = useState(null);
  const [productsData, setProductsData] = useState([]);

  const tabs = [
    { id: 'builder', label: t('productBuilder') || 'בונה מוצרים', icon: Plus },
    { id: 'csv', label: t('csvImport') || 'ייבוא CSV/Excel', icon: FileSpreadsheet },
    { id: 'update', label: t('updateMode') || 'עדכון מוצרים', icon: RefreshCw },
  ];

  const handleValidation = (results) => {
    setValidationResults(results);
  };

  const handleProductsGenerated = (products) => {
    setProductsData(products);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-right">
            {t('imports') || 'ייבוא מוצרים'}
          </h1>
          <p className="text-gray-600 mt-2 text-right">
            {t('importsDescription') || 'ייבוא ועדכון מוצרים מ-CSV, Excel או יצירה ידנית'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 flex-row-reverse" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none hover:bg-transparent
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px]" />
                {tab.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'builder' && (
          <ProductBuilder
            onValidation={handleValidation}
            onProductsGenerated={handleProductsGenerated}
          />
        )}

        {activeTab === 'csv' && (
          <CSVImporter
            onValidation={handleValidation}
            onProductsGenerated={handleProductsGenerated}
          />
        )}

        {activeTab === 'update' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-right">
              {t('updateMode') || 'עדכון מוצרים קיימים'}
            </h2>
            <p className="text-gray-600 mb-6 text-right">
              {t('updateModeDescription') || 'העלה קובץ CSV עם SKU או ID כדי לעדכן מחירים ומלאי'}
            </p>
            <CSVImporter
              mode="update"
              onValidation={handleValidation}
              onProductsGenerated={handleProductsGenerated}
            />
          </div>
        )}
      </div>

      {/* Validation Results */}
      {validationResults && (
        <ValidationResults results={validationResults} />
      )}

      {/* Export Panel */}
      {productsData.length > 0 && (
        <ExportPanel products={productsData} />
      )}
    </div>
  );
};

export default Imports;

