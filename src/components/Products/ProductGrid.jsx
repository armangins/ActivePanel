import ProductCard from './ProductCard';

const ProductGrid = ({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, columns = 4 }) => {
  // Map columns to Tailwind grid classes
  const gridColsClass = {
    1: 'grid-cols-1', // Mobile: 1 column, Desktop: 1 column
    2: 'grid-cols-2 md:grid-cols-2', // Mobile: 2 columns, Desktop: 2 columns
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4', // Mobile: 1 column (default for desktop selections), Desktop: 4 columns
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={`grid ${gridColsClass[columns] || gridColsClass[4]} gap-3 sm:gap-4 md:gap-6`}>
      {products.map((product) => {
        // Calculate values for ProductCard
        const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
        // Gallery images (all images except the first one)
        const galleryImages = product.images && product.images.length > 1 
          ? product.images.slice(1).map(img => img.src || img.url || img.source_url).filter(Boolean)
          : [];
        const productName = product.name || t('productName');
        const stockStatus = product.stock_status || 'instock';
        const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');
        const sku = product.sku ? `${t('sku')}: ${product.sku}` : null;
        
        // Price calculations
        const hasSalePrice = product.sale_price && parseFloat(product.sale_price) > 0;
        const regularPriceValue = parseFloat(product.regular_price || product.price || 0);
        const salePriceValue = hasSalePrice ? parseFloat(product.sale_price) : null;
        
        // Calculate discount percentage
        let discountPercentage = 0;
        if (hasSalePrice && regularPriceValue > 0) {
          discountPercentage = Math.round(((regularPriceValue - salePriceValue) / regularPriceValue) * 100);
        }
        
        // Format prices
        const displayPrice = formatCurrency(regularPriceValue);
        const formattedSalePrice = salePriceValue ? formatCurrency(salePriceValue) : null;
        const formattedRegularPrice = regularPriceValue > 0 ? formatCurrency(regularPriceValue) : null;
        
        return (
          <ProductCard
            key={product.id}
            product={product}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            imageUrl={imageUrl}
            galleryImages={galleryImages}
            productName={productName}
            stockStatus={stockStatus}
            stockStatusLabel={stockStatusLabel}
            sku={sku}
            displayPrice={displayPrice}
            salePrice={formattedSalePrice}
            regularPrice={formattedRegularPrice}
            discountPercentage={discountPercentage}
            stockQuantity={product.stock_quantity}
            stockLabel={t('stock')}
            editLabel={t('editProduct')}
            deleteLabel={t('deleteProduct')}
            offLabel={t('off')}
            isRTL={isRTL}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;

