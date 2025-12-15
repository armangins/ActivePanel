import React from 'react';

const ProductCardPrice = ({
    salePrice,
    regularPrice,
    displayPrice,
    discountPercentage,
    offLabel,
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            flexDirection: 'row', 
            justifyContent: 'flex-start', 
            gap: '8px', 
            marginTop: '8px',
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
    );
};

export default ProductCardPrice;
