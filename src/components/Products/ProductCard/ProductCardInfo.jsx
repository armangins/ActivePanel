import React from 'react';

const ProductCardInfo = ({
    productName,
    stockStatus,
    stockStatusLabel,
    sku,
    stockQuantity,
    stockLabel,
}) => {
    return (
        <div className="mb-3">
            <div className={`flex items-baseline flex-row-reverse justify-center gap-2 mb-2`}>
                {stockStatus === 'instock' ? (
                    <div className={`flex items-center gap-1.5 flex-shrink-0 flex-row-reverse`}>
                        <span className="text-xs font-medium text-gray-700">
                            {stockStatusLabel}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded flex-shrink-0 bg-orange-100 text-orange-800">
                        {stockStatusLabel}
                    </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1 text-right">
                    {productName}
                </h3>
            </div>
            <div className="text-right">
                {sku && (
                    <p className="text-sm text-gray-500">{sku}</p>
                )}
                {stockQuantity !== null && stockQuantity !== undefined && (
                    <p className="text-sm text-gray-500">
                        {stockLabel}: {stockQuantity}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductCardInfo;
