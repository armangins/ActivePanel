import React from 'react';
import ProductRating from './ProductRating';

const ProductCardInfo = ({
    productName,
    stockStatus,
    stockStatusLabel,
    sku,
    stockQuantity,
    stockLabel,
    product,
    salePrice,
    regularPrice,
    displayPrice,
    discountPercentage,
    offLabel,
}) => {
    // Extract product name and variant
    const nameParts = productName ? productName.split(',') : [];
    const mainName = nameParts[0]?.trim() || productName || '';
    const variant = nameParts.length > 1 ? nameParts.slice(1).join(',').trim() : '';
    
    // Get short description from product
    const shortDescription = product?.short_description || product?.description || '';
    // Strip HTML tags and limit length
    const cleanDescription = shortDescription
        .replace(/<[^>]*>/g, '')
        .trim()
        .substring(0, 100);
    
    // Get rating from product (WooCommerce uses average_rating)
    const rating = product?.average_rating || 0;
    const reviewCount = product?.rating_count || 0;

    return (
        <div style={{ marginBottom: '12px' }}>
            {/* Product Name and Variant */}
            <div style={{ marginBottom: '8px' }}>
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: '#374151', 
                    margin: 0,
                    lineHeight: '1.4'
                }}>
                    {mainName}
                    {variant && (
                        <span style={{ 
                            fontSize: '14px', 
                            fontWeight: 400, 
                            color: '#6b7280',
                            marginLeft: '4px'
                        }}>
                            {variant}
                        </span>
                    )}
                </h3>
            </div>

            {/* Pricing */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                flexDirection: 'row', 
                justifyContent: 'flex-start', 
                gap: '8px', 
                flexWrap: 'wrap' 
            }}>
                {salePrice ? (
                    <>
                        <p style={{ fontSize: '16px', fontFamily: 'inherit', color: '#374151', fontWeight: 500, margin: 0 }}>
                            {salePrice}
                        </p>
                        {regularPrice && (
                            <p style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through', margin: 0 }}>
                                {regularPrice}
                            </p>
                        )}
                        {discountPercentage > 0 && (
                            <span style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: '#10b981',
                                marginLeft: '4px'
                            }}>
                                {discountPercentage}% {offLabel || 'off'}
                            </span>
                        )}
                    </>
                ) : (
                    <p style={{ fontSize: '16px', fontFamily: 'inherit', color: '#374151', fontWeight: 500, margin: 0 }}>
                        {displayPrice}
                    </p>
                )}
            </div>

            {/* Rating */}
            {rating > 0 && (
                <ProductRating rating={rating} reviewCount={reviewCount} />
            )}

            {/* Short Description */}
            {cleanDescription && (
                <p style={{ 
                    fontSize: '13px', 
                    color: '#6b7280', 
                    lineHeight: '1.5',
                    margin: '8px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {cleanDescription}
                </p>
            )}
        </div>
    );
};

export default ProductCardInfo;
