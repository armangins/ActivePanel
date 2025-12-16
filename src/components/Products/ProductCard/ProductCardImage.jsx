import { useState, useCallback } from 'react';
import { InboxOutlined as Package } from '@ant-design/icons';
import { theme } from 'antd';
import { OptimizedImage } from '../../ui';

const ProductCardImage = ({
    imageUrl,
    galleryImages = [],
    productName,
}) => {
    const { token } = theme.useToken();
    // Gallery state - track which image is currently displayed as main (0 = original main, 1+ = gallery index)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Combine all images: main image + gallery images
    const allImages = imageUrl ? [imageUrl, ...galleryImages] : galleryImages;

    // Get current main image based on selected index
    const currentMainImage = allImages[selectedImageIndex] || imageUrl;

    // Get thumbnail images (all images except the currently selected one)
    const thumbnailImages = allImages.filter((_, index) => index !== selectedImageIndex);

    const handleThumbnailClick = useCallback((e, index) => {
        e.stopPropagation(); // Prevent card click
        // Calculate the actual index in allImages array
        const clickedImageUrl = thumbnailImages[index];
        const actualIndex = allImages.findIndex(img => img === clickedImageUrl);
        if (actualIndex !== -1) {
            setSelectedImageIndex(actualIndex);
        }
    }, [thumbnailImages, allImages]);

    return (
        <div style={{ width: '100%' }}>
            {/* Main Image */}
            <div style={{
                width: '100%',
                position: 'relative',
                backgroundColor: token.colorFillQuaternary,
                borderTopLeftRadius: token.borderRadiusLG,
                borderTopRightRadius: token.borderRadiusLG,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
            }}>
                {currentMainImage ? (
                    <OptimizedImage
                        src={currentMainImage}
                        alt={productName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        resize={false}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Package style={{ width: '48px', height: '48px', color: token.colorTextQuaternary }} />
                    </div>
                )}
            </div>

            {/* Gallery Thumbnails */}
            {/* PERFORMANCE: Only show thumbnails if there are images (lazy render) */}
            {thumbnailImages.length > 0 && (
                <div style={{
                    padding: `${token.paddingXXS}px ${token.paddingXS}px ${token.paddingXS}px ${token.paddingXS}px`,
                    display: 'flex',
                    gap: token.marginXXS,
                    overflowX: 'auto'
                }}>
                    {/* PERFORMANCE: Limit to 3 thumbnails initially for faster rendering */}
                    {thumbnailImages.slice(0, 3).map((thumbnailImage, index) => {
                        // Check if this thumbnail corresponds to the currently selected main image
                        const isSelected = allImages[selectedImageIndex] === thumbnailImage;

                        return (
                            <div
                                key={`${thumbnailImage}-${index}`}
                                onClick={(e) => handleThumbnailClick(e, index)}
                                style={{
                                    flexShrink: 0,
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: token.borderRadiusSM,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    backgroundColor: token.colorFillQuaternary,
                                    border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                                    boxShadow: isSelected ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none',
                                    opacity: isSelected ? 1 : 0.9,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = token.colorPrimary;
                                        e.currentTarget.style.opacity = '1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = token.colorBorderSecondary;
                                        e.currentTarget.style.opacity = '0.9';
                                    }
                                }}
                                title={`Click to view this image`}
                            >
                                <OptimizedImage
                                    src={thumbnailImage}
                                    alt={`${productName} - Gallery ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    // PERFORMANCE: Resize thumbnails (48x48 for 12x12 grid)
                                    resize={true}
                                    width={48}
                                    height={48}
                                />
                            </div>
                        );
                    })}
                    {thumbnailImages.length > 3 && (
                        <div style={{
                            flexShrink: 0,
                            width: '48px',
                            height: '48px',
                            borderRadius: token.borderRadiusSM,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            backgroundColor: token.colorFillQuaternary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>+{thumbnailImages.length - 3}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default ProductCardImage;
