import React from 'react';
import { Rate, theme, Typography, Space } from 'antd';

const { Title, Text, Paragraph } = Typography;

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
    const { token } = theme.useToken();

    // Extract product name and variant
    const nameParts = productName ? productName.split(',') : [];
    const mainName = nameParts[0]?.trim() || productName || '';
    const variant = nameParts.length > 1 ? nameParts.slice(1).join(',').trim() : '';

    // Get short description from product (strip HTML if simple needed, but Paragraph handles text content)
    // We strictly need plain text for safer rendering if not using dangerouslySetInnerHTML
    const shortDescription = product?.short_description || product?.description || '';
    const cleanDescription = shortDescription.replace(/<[^>]*>/g, '').trim();

    // Get rating from product
    const rating = product?.average_rating || 0;

    return (
        <div style={{ marginBottom: token.marginXS }}>
            {/* Product Name and Variant */}
            <div style={{ marginBottom: token.marginXS }}>
                <Title level={5} style={{ margin: 0, fontSize: token.fontSizeLG, lineHeight: '1.4' }}>
                    {mainName}
                    {variant && (
                        <Text type="secondary" style={{ fontSize: token.fontSize, fontWeight: 400, marginLeft: 4 }}>
                            {variant}
                        </Text>
                    )}
                </Title>
            </div>

            {/* Pricing */}
            <Space wrap size={token.marginXS} align="baseline">
                {salePrice ? (
                    <>
                        <Text strong style={{ fontSize: token.fontSizeLG, color: token.colorText }}>
                            {salePrice}
                        </Text>
                        {regularPrice && (
                            <Text delete type="secondary" style={{ fontSize: token.fontSize }}>
                                {regularPrice}
                            </Text>
                        )}
                        {discountPercentage > 0 && (
                            <Text type="success" strong style={{ fontSize: token.fontSize }}>
                                {discountPercentage}% {offLabel || 'off'}
                            </Text>
                        )}
                    </>
                ) : (
                    <Text strong style={{ fontSize: token.fontSizeLG, color: token.colorText }}>
                        {displayPrice}
                    </Text>
                )}
            </Space>

            {/* Rating */}
            {rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS, marginTop: token.marginXS }}>
                    <Rate disabled allowHalf value={parseFloat(rating)} style={{ fontSize: token.fontSize, color: token.colorWarning }} />
                    <Text type="secondary" style={{ fontSize: token.fontSize }}>
                        {parseFloat(rating).toFixed(1)}
                    </Text>
                </div>
            )}

            {/* Short Description */}
            {cleanDescription && (
                <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{
                        fontSize: '13px', // Keep slightly smaller as per original design
                        marginBottom: 0,
                        marginTop: token.marginXS,
                        lineHeight: '1.5'
                    }}
                >
                    {cleanDescription}
                </Paragraph>
            )}
        </div>
    );
};

export default ProductCardInfo;
