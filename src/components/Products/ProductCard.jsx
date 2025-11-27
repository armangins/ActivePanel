import { Package, Edit, Trash2 } from 'lucide-react';

const ProductCard = ({ 
  product, 
  onView,
  onEdit, 
  onDelete,
  // Display props
  imageUrl,
  productName,
  stockStatus,
  stockStatusLabel,
  sku,
  displayPrice,
  salePrice,
  regularPrice,
  discountPercentage,
  stockQuantity,
  stockLabel,
  editLabel,
  deleteLabel,
  offLabel,
  isRTL
}) => {
  const handleCardClick = () => {
    if (onView) onView(product);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="w-full aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="text-gray-400" size={48} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product Name, Stock Status, and SKU */}
        <div className="mb-3">
          <div className={`flex items-center ${'flex-row-reverse'} justify-center gap-2 mb-2`}>
            <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1 text-left">
              {productName}
            </h3>
            {stockStatus === 'instock' ? (
              <div className={`flex items-center gap-1.5 flex-shrink-0 ${'flex-row-reverse'}`}>
                <span className="text-xs font-medium text-gray-700">
                  {stockStatusLabel}
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded flex-shrink-0 bg-red-100 text-red-800">
                {stockStatusLabel}
              </span>
            )}
          </div>
          {sku && (
            <p className="text-sm text-gray-500 text-left">{sku}</p>
          )}
        </div>

        {/* First Row: Prices and Discount */}
        <div className={`flex items-center ${'flex-row-reverse'} justify-end gap-2 pt-3 border-t border-gray-200 flex-wrap`}>
          {salePrice ? (
            <>
              <p className="text-2xl font-bold text-primary-500">
                {salePrice}
              </p>
              {regularPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {regularPrice}
                </p>
              )}
              {discountPercentage > 0 && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                  {discountPercentage}% {offLabel}
                </span>
              )}
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {displayPrice}
            </p>
          )}
        </div>

        {/* Second Row: Action Buttons and Stock (stock under buttons) */}
        <div className="flex pt-2 mt-auto w-full justify-start">
          <div className="flex flex-col items-start w-full">
            <div className={`flex ${'flex-row-reverse'} gap-2`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(product);
                }}
                className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                title={editLabel}
              >
                <Edit size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(product.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={deleteLabel}
              >
                <Trash2 size={18} />
              </button>
            </div>
            {stockQuantity !== null && stockQuantity !== undefined && (
              <p className="text-sm text-gray-500 mt-1 text-right w-full">
                {stockLabel}: {stockQuantity}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

