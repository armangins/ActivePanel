import { useEffect, useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined as Plus,
  FilterOutlined as SlidersHorizontal,
  DeleteOutlined as Trash,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { Button } from '../../ui';
import FiltersModal from '../FiltersModal/FiltersModal';
import GridColumnSelector from '../GridColumnSelector/GridColumnSelector';
import { Typography, Badge, Popover, Segmented } from 'antd';
const { Title, Text } = Typography;

const ProductsHeader = memo(({
  displayedCount,
  totalCount,
  onCreateProduct,
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
  isRTL,
  t,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  showFilters,
  // Filter props for modal
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  products = [],
  // Bulk delete props
  selectedProductIds = new Set(),
  onBulkDelete
}) => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilters &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onToggleFilters();
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, onToggleFilters]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', minWidth: 0, gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row', flexShrink: 0 }}>
        {/* View Mode Toggle */}
        <Segmented
          value={viewMode}
          onChange={onViewModeChange}
          options={[
            { value: 'list', icon: <BarsOutlined /> },
            { value: 'grid', icon: <AppstoreOutlined /> },
          ]}
        />

        {/* Grid Columns Selector - Only show when grid view is active */}
        {viewMode === 'grid' && (
          <GridColumnSelector
            gridColumns={gridColumns}
            onGridColumnsChange={onGridColumnsChange}
            isRTL={isRTL}
            t={t}
          />
        )}

        {/* Filters Button with Popover */}
        <Popover
          content={
            <div style={{ width: 384, direction: isRTL ? 'rtl' : 'ltr' }}>
              <FiltersModal
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                minPrice={minPrice}
                onMinPriceChange={onMinPriceChange}
                maxPrice={maxPrice}
                onMaxPriceChange={onMaxPriceChange}
                products={products}
                isRTL={isRTL}
                t={t}
                onClose={onToggleFilters}
              />
            </div>
          }
          trigger="click"
          open={showFilters}
          onOpenChange={onToggleFilters}
          placement={isRTL ? 'bottomRight' : 'bottomLeft'}
        >
          <Button
            variant="secondary"
            onClick={onToggleFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <SlidersHorizontal />
            <span>{t('filters')}</span>
            {hasActiveFilters && (
              <Badge count={activeFilterCount} style={{ backgroundColor: '#4560FF' }} />
            )}
          </Button>
        </Popover>

        {/* Bulk Delete Button - Only show in list view when items are selected */}
        {viewMode === 'list' && selectedProductIds && selectedProductIds.size > 0 && (
          <Button
            variant="danger"
            onClick={onBulkDelete}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <Trash />
            <span>{t('deleteSelected') || 'Delete Selected'} ({selectedProductIds.size})</span>
          </Button>
        )}

        {/* Create Product Button */}
        <Button
          variant="primary"
          onClick={() => {
            if (onCreateProduct) {
              onCreateProduct();
            } else {
              navigate('/products/add');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <Plus />
          <span>{t('createProduct')}</span>
        </Button>
      </div>
      <div style={{ minWidth: 0, flexShrink: 1, textAlign: isRTL ? 'right' : 'left' }}>
        <Title level={1} style={{ marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('products')}</Title>
        <Text type="secondary" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {t('showing')} {displayedCount} {t('of')} {totalCount} {t('products').toLowerCase()}
        </Text>
      </div>
    </div>
  );
});

ProductsHeader.displayName = 'ProductsHeader';

export default ProductsHeader;

