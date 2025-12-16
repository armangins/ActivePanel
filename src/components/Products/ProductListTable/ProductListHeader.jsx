import { UpOutlined as ChevronUp, DownOutlined as ChevronDown, SwapOutlined as ArrowUpDown } from '@ant-design/icons';
import { Button } from '../../ui';
import { Checkbox, theme, Space } from 'antd';

/**
 * ProductListHeader Component
 * 
 * Table header row with column titles.
 */
const ProductListHeader = ({ products, isRTL, t, sortField, sortDirection, onSort, selectedProductIds, onSelectAll }) => {
  const { token } = theme.useToken();
  const allSelected = products.length > 0 && products.every(p => selectedProductIds?.has(p.id));
  const someSelected = products.some(p => selectedProductIds?.has(p.id)) && !allSelected;

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown style={{ fontSize: 14, color: token.colorTextQuaternary }} />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp style={{ fontSize: 14, color: token.colorPrimary }} />
      : <ChevronDown style={{ fontSize: 14, color: token.colorPrimary }} />;
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'right', // Default alignment
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    backgroundColor: token.colorFillQuaternary,
    fontSize: 14,
    fontWeight: 500,
    color: token.colorText,
    whiteSpace: 'nowrap',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  return (
    <thead style={{ backgroundColor: token.colorFillQuaternary }}>
      <tr>
        {/* Checkbox Column */}
        <th style={{ ...thStyle, width: 48, textAlign: 'center' }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => {
              if (onSelectAll) {
                onSelectAll(e.target.checked);
              }
            }}
            aria-label={t('selectAll') || 'Select all products'}
          />
        </th>

        {/* Products Column */}
        <th style={thStyle}>
          <Button
            variant="ghost"
            onClick={() => onSort && onSort('name')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              padding: 0,
              height: 'auto',
              color: sortField === 'name' ? token.colorPrimary : 'inherit',
              gap: 8,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            {t('products')}
            {getSortIcon('name')}
          </Button>
        </th>

        {/* Category Column */}
        <th style={thStyle}>
          <Space>
            {t('category')}
          </Space>
        </th>

        {/* Price Column */}
        <th style={thStyle}>
          <Button
            variant="ghost"
            onClick={() => onSort && onSort('price')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              padding: 0,
              height: 'auto',
              color: sortField === 'price' ? token.colorPrimary : 'inherit',
              gap: 8,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            {t('price')}
            {getSortIcon('price')}
          </Button>
        </th>

        {/* Sale Price Column */}
        <th style={thStyle}>
          <Space>
            {t('salePrice') || 'Sale Price'}
          </Space>
        </th>

        {/* Stock Status Column */}
        <th style={thStyle}>
          <Space>
            {t('stockStatus')}
          </Space>
        </th>

        {/* Actions Column */}
        <th style={{ ...thStyle, width: 64, textAlign: 'center' }}>
          <span className="sr-only">{t('actions')}</span>
        </th>
      </tr>
    </thead>
  );
};

export default ProductListHeader;

