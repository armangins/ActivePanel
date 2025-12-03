import React from 'react';

const ProductCardPrice = ({
    salePrice,
    regularPrice,
    displayPrice,
    discountPercentage,
    offLabel,
}) => {
    return (
        <div className={`flex items-center flex-row-reverse justify-end gap-2 pt-3 border-t border-gray-200 flex-wrap`}>
            {salePrice ? (
                <>
                    <p className="text-2xl font-regular text-primary-500">
                        {salePrice}
                    </p>
                    {regularPrice && (
                        <p className="text-sm text-gray-400 line-through">
                            {regularPrice}
                        </p>
                    )}
                    {discountPercentage > 0 && (
                        <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded">
                            {discountPercentage}% {offLabel}
                        </span>
                    )}
                </>
            ) : (
                <p className="text-2xl font-regular text-gray-900">
                    {displayPrice}
                </p>
            )}
        </div>
    );
};

export default ProductCardPrice;
