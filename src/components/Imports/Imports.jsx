import React, { useState } from 'react';
import { UploadOutlined, TableOutlined as FileSpreadsheet, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined, PlusOutlined as Plus, ReloadOutlined as RefreshCw } from '@ant-design/icons';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { Tabs } from 'antd';
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
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8, textAlign: 'right' }}>
          {t('imports') || 'ייבוא מוצרים'}
        </h1>
        <p style={{ color: '#666', textAlign: 'right' }}>
          {t('importsDescription') || 'ייבוא ועדכון מוצרים מ-CSV, Excel או יצירה ידנית'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs.map(tab => ({
          key: tab.id,
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {React.createElement(tab.icon, { style: { fontSize: 16 } })}
              {tab.label}
            </span>
          ),
          children: (
            <div style={{ marginTop: 24 }}>
              {tab.id === 'builder' && (
                <ProductBuilder
                  onValidation={handleValidation}
                  onProductsGenerated={handleProductsGenerated}
                />
              )}

              {tab.id === 'csv' && (
                <CSVImporter
                  mode="import"
                  onValidation={handleValidation}
                  onProductsGenerated={handleProductsGenerated}
                />
              )}

              {tab.id === 'update' && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, textAlign: 'right' }}>
                    {t('updateMode') || 'עדכון מוצרים קיימים'}
                  </h2>
                  <p style={{ color: '#666', marginBottom: 24, textAlign: 'right' }}>
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
          ),
        }))}
        direction="rtl"
      />

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

