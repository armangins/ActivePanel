import React from 'react';
import { Rate, theme } from 'antd';

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

    const { token } = theme.useToken();

    return (
        <div style={{ marginBottom: token.marginXS }}>
            {/* Product Name and Variant */}
            <div style={{ marginBottom: token.marginXS }}>
                <h3 style={{
                    fontSize: token.fontSizeLG,
                    fontWeight: 600,
                    color: token.colorText,
                    margin: 0,
                    lineHeight: '1.4'
                }}>
                    {mainName}
                    {variant && (
                        <span style={{
                            fontSize: token.fontSize,
                            fontWeight: 400,
                            color: token.colorTextSecondary,
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
                gap: token.marginXS,
                flexWrap: 'wrap'
            }}>
                {salePrice ? (
                    <>
                        <p style={{ fontSize: token.fontSizeLG, fontFamily: 'inherit', color: token.colorText, fontWeight: 500, margin: 0 }}>
                            {salePrice}
                        </p>
                        {regularPrice && (
                            <p style={{ fontSize: token.fontSize, color: token.colorTextTertiary, textDecoration: 'line-through', margin: 0 }}>
                                {regularPrice}
                            </p>
                        )}
                        {discountPercentage > 0 && (
                            <span style={{
                                fontSize: token.fontSize,
                                fontWeight: 500,
                                color: token.colorSuccess,
                                marginLeft: '4px'
                            }}>
                                {discountPercentage}% {offLabel || 'off'}
                            </span>
                        )}
                    </>
                ) : (
                    <p style={{ fontSize: token.fontSizeLG, fontFamily: 'inherit', color: token.colorText, fontWeight: 500, margin: 0 }}>
                        {displayPrice}
                    </p>
                )}
            </div>

            {/* Rating */}
            {rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS, marginTop: token.marginXS }}>
                    <Rate disabled allowHalf value={rating} style={{ fontSize: token.fontSize, color: token.colorWarning }} />
                    <span style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>
                        {rating.toFixed(1)}
                    </span>
                </div>
            )}

            {/* Short Description */}
            {cleanDescription && (
                <p style={{
                    fontSize: '13px',
                    color: token.colorTextSecondary,
                    lineHeight: '1.5',
                    margin: `${token.marginXS}px 0 0 0`,
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
