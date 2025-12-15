import { DownloadOutlined as Download, FileTextOutlined as FileSpreadsheet } from '@ant-design/icons';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateWooCommerceCSV, downloadCSV } from '../../utils/csvProcessor';

const ExportPanel = ({ products }) => {
  const { t } = useLanguage();

  const handleExport = () => {
    const csvContent = generateWooCommerceCSV(products);
    const filename = `woocommerce-products-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="card bg-primary-50 border-primary-200">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3 flex-row-reverse">
          <FileSpreadsheet className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-primary-900">
              {t('readyToExport') || 'מוכן לייצוא'}
            </h3>
            <p className="text-sm text-primary-700">
              {products.length} {t('productsReady') || 'מוצרים מוכנים לייצוא'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          variant="primary"
          className="flex items-center gap-2 flex-row-reverse"
        >
          <Download className="w-[18px] h-[18px]" />
          {t('exportCSV') || 'ייצא CSV'}
        </Button>
      </div>
      <p className="text-xs text-primary-600 mt-3 text-right">
        {t('exportDescription') || 'הקובץ יווצר בפורמט UTF-8 התואם ל-WooCommerce'}
      </p>
    </div>
  );
};

export default ExportPanel;

