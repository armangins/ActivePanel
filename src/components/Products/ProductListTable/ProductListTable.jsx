import { useState, useMemo, memo, useCallback } from 'react';
import { Table, Space, Tag, Dropdown, Button as AntButton } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, UpOutlined, DownOutlined, SwapOutlined, RightOutlined, LeftOutlined, InboxOutlined as Package } from '@ant-design/icons';
import ProductListTableSkeleton from './ProductListTableSkeleton';
import { validateProductId, validateProduct, sanitizeProductName, validateImageUrl, sanitizeCategoryName } from '../utils/securityHelpers';
import { secureLog } from '../../../utils/logger';
import { OptimizedImage } from '../../ui';
import { calculateVariationPriceRange, formatPriceRange, getRegularPrice, hasSalePrice, getSalePrice } from './utils/priceHelpers';
import ProductVariationsRow from './ProductVariationsRow';

/**
 * ProductListTable Component
 * 
 * Main table component that displays products in a list/table format.
 * Handles action menu state and product selection.
 * 
 * @param {Array} products - Array of product objects to display
 * @param {Function} onView - Callback when a product row is clicked
 * @param {Function} onEdit - Callback when edit action is triggered
 * @param {Function} onDelete - Callback when delete action is triggered
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {String} sortField - Current sort field ('name' or 'price')
 * @param {String} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is triggered
 * @param {Set} selectedProductIds - Set of selected product IDs (controlled)
 * @param {Function} onSelectionChange - Callback when selection changes
 */
const ProductListTable = memo(({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort, isLoading = false, selectedProductIds = new Set(), onSelectionChange }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Filter valid products
  const validProducts = useMemo(() => {
    return products.filter(product => validateProduct(product));
  }, [products]);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <SwapOutlined style={{ fontSize: 14, color: '#bfbfbf' }} />;
    }
    return sortDirection === 'asc'
      ? <UpOutlined style={{ fontSize: 14, color: '#1890ff' }} />
      : <DownOutlined style={{ fontSize: 14, color: '#1890ff' }} />;
  };

  // Render product cell
  const renderProductCell = useCallback((product) => {
    const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
    const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
    const productName = sanitizeProductName(product.name || t('productName'));
    const isVariable = product.type === 'variable';
    const isExpanded = expandedRowKeys.includes(product.id);

    // Get variation details
    const getVariationDetails = () => {
      if (!product.attributes || !Array.isArray(product.attributes)) return null;
      const variationAttributes = product.attributes.filter(attr => attr.variation === true);
      if (variationAttributes.length === 0) return null;
      return variationAttributes.map(attr => {
        const options = attr.options || [];
        if (options.length === 0) return null;
        const values = options.join(' , ');
        return `${attr.name} : ${values}`;
      }).filter(Boolean);
    };
    const variationDetails = getVariationDetails();

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, direction: isRTL ? 'rtl' : 'ltr' }}>
        {isVariable && (
          <AntButton
            type="text"
            size="small"
            icon={isExpanded ? <DownOutlined /> : (isRTL ? <LeftOutlined /> : <RightOutlined />)}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedRowKeys(prev => 
                prev.includes(product.id) 
                  ? prev.filter(id => id !== product.id)
                  : [...prev, product.id]
              );
            }}
            style={{ marginTop: 4 }}
          />
        )}
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imageUrl ? (
            <OptimizedImage src={imageUrl} alt={productName} resize={true} width={48} height={48} />
          ) : (
            <Package style={{ fontSize: 20, color: '#bfbfbf' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 4 }}>{productName}</div>
          {variationDetails && variationDetails.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {variationDetails.map((detail, index) => (
                <div key={index} style={{ fontSize: 12, color: '#8c8c8c' }}>{detail}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [isRTL, t]);

  // Render category cell
  const renderCategoryCell = useCallback((product) => {
    const categoryName = product.categories && product.categories.length > 0
      ? sanitizeCategoryName(product.categories[0].name)
      : '-';
    return <span style={{ fontSize: 14, color: '#595959' }}>{categoryName}</span>;
  }, []);

  // Render price cell
  const renderPriceCell = useCallback((product) => {
    const isVariable = product.type === 'variable';
    if (isVariable && product.variations) {
      const priceRange = calculateVariationPriceRange(product.variations);
      if (priceRange) {
        return (
          <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
            {formatPriceRange(priceRange.minPrice, priceRange.maxPrice, formatCurrency)}
          </span>
        );
      }
    }
    const regularPriceValue = getRegularPrice(product);
    const hasSale = hasSalePrice(product);
    return (
      <span style={{ 
        fontSize: 14, 
        fontWeight: 500, 
        color: hasSale ? '#8c8c8c' : '#262626',
        textDecoration: hasSale ? 'line-through' : 'none'
      }}>
        {formatCurrency(regularPriceValue)}
      </span>
    );
  }, [formatCurrency]);

  // Render sale price cell
  const renderSalePriceCell = useCallback((product) => {
    if (product.type === 'variable') {
      return <span style={{ fontSize: 14, color: '#bfbfbf' }}>-</span>;
    }
    const salePriceValue = getSalePrice(product);
    return salePriceValue ? (
      <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
        {formatCurrency(salePriceValue)}
      </span>
    ) : (
      <span style={{ fontSize: 14, color: '#bfbfbf' }}>-</span>
    );
  }, [formatCurrency]);

  // Render stock cell
  const renderStockCell = useCallback((product) => {
    const stockStatus = product.stock_status || 'instock';
    const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');
    return stockStatus === 'instock' ? (
      <Space size={8} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#595959' }}>{stockStatusLabel}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#52c41a' }} />
      </Space>
    ) : (
      <span style={{ fontSize: 14, fontWeight: 500, color: '#ff7a45' }}>{stockStatusLabel}</span>
    );
  }, [isRTL, t]);

  // Render actions cell
  const renderActionsCell = useCallback((product) => {
    const menuItems = [
      {
        key: 'edit',
        label: t('edit') || 'עריכה',
        icon: <EditOutlined />,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          onEdit && onEdit(product);
        }
      },
      {
        key: 'delete',
        label: t('removeProduct') || t('deleteProduct') || 'מחק',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          onDelete && onDelete(product);
        }
      }
    ];

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <AntButton
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => e.stopPropagation()}
          style={{ color: '#bfbfbf' }}
        />
      </Dropdown>
    );
  }, [t, onEdit, onDelete]);

  // Define columns
  const columns = useMemo(() => [
    {
      title: t('products'),
      key: 'product',
      align: isRTL ? 'right' : 'left',
      render: (_, product) => renderProductCell(product),
      sorter: sortField === 'name',
      sortOrder: sortField === 'name' ? (sortDirection === 'asc' ? 'ascend' : 'descend') : null,
      onHeaderCell: () => ({
        onClick: () => onSort && onSort('name'),
        style: { cursor: 'pointer' }
      })
    },
    {
      title: t('category'),
      key: 'category',
      align: isRTL ? 'right' : 'left',
      render: (_, product) => renderCategoryCell(product)
    },
    {
      title: t('price'),
      key: 'price',
      align: isRTL ? 'right' : 'left',
      render: (_, product) => renderPriceCell(product),
      sorter: sortField === 'price',
      sortOrder: sortField === 'price' ? (sortDirection === 'asc' ? 'ascend' : 'descend') : null,
      onHeaderCell: () => ({
        onClick: () => onSort && onSort('price'),
        style: { cursor: 'pointer' }
      })
    },
    {
      title: t('salePrice') || 'Sale Price',
      key: 'salePrice',
      align: isRTL ? 'right' : 'left',
      render: (_, product) => renderSalePriceCell(product)
    },
    {
      title: t('stockStatus'),
      key: 'stock',
      align: isRTL ? 'right' : 'left',
      render: (_, product) => renderStockCell(product)
    },
    {
      title: t('actions'),
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, product) => renderActionsCell(product)
    }
  ], [isRTL, t, sortField, sortDirection, onSort, renderProductCell, renderCategoryCell, renderPriceCell, renderSalePriceCell, renderStockCell, renderActionsCell]);

  // Row selection config
  const rowSelection = useMemo(() => ({
    selectedRowKeys: Array.from(selectedProductIds),
    onChange: (selectedRowKeys) => {
      if (onSelectionChange) {
        const validIds = new Set(
          selectedRowKeys
            .map(id => validateProductId(id))
            .filter(id => id !== null)
        );
        onSelectionChange(validIds);
      }
    },
    getCheckboxProps: (record) => ({
      name: `product-${record.id}`
    })
  }), [selectedProductIds, onSelectionChange]);

  // Expanded row render
  const expandedRowRender = (product) => {
    return (
      <div style={{ padding: '16px 48px' }}>
        <ProductVariationsRow
          product={product}
          formatCurrency={formatCurrency}
          t={t}
          isRTL={isRTL}
        />
      </div>
    );
  };

  // Show skeleton while loading
  if (isLoading && validProducts.length === 0) {
    return <ProductListTableSkeleton count={16} />;
  }

  // If no products, don't render table
  if (validProducts.length === 0) {
    return null;
  }

  return (
    <Table
      columns={columns}
      dataSource={validProducts}
      rowKey="id"
      rowSelection={rowSelection}
      expandedRowKeys={expandedRowKeys}
      onExpandedRowsChange={setExpandedRowKeys}
      expandedRowRender={expandedRowRender}
      onRow={(record) => ({
        onClick: () => onView && onView(record),
        style: { cursor: 'pointer' }
      })}
      pagination={false}
      loading={isLoading}
      scroll={{ x: true }}
      style={{ backgroundColor: '#fff' }}
    />
  );
});

ProductListTable.displayName = 'ProductListTable';

export default ProductListTable;

