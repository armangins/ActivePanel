import { useState, useCallback, useMemo } from 'react';
import { InboxOutlined as Package } from '@ant-design/icons';
import { Image, Flex, Typography, theme } from 'antd';

const { Title, Text } = Typography;

/**
 * ProductDetailsMedia Component
 */
const ProductDetailsMedia = ({ product, isRTL, t }) => {
  const { token } = theme.useToken();

  // Extract all image URLs from product
  const allImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) return [];
    return product.images.map(img => img.src || img.url || img.source_url).filter(Boolean);
  }, [product?.images]);

  // State to track which image is currently displayed as main
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get current main image
  const currentMainImage = allImages[selectedImageIndex] || null;

  // Get thumbnail images (all images except the currently selected one) - Actually keeping all thumbnails is better for navigation, but following existing logic
  const thumbnailImages = useMemo(() => {
    // Show all images in thumbnails strip for better UX, highlight selected
    return allImages;
  }, [allImages]);

  // Handle thumbnail click to swap images
  const handleThumbnailClick = useCallback((index) => {
    setSelectedImageIndex(index);
  }, []);

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>{t('media') || 'Media'}</Title>

      {/* Main Image */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        border: `1px solid ${token.colorBorderSecondary}`,
        backgroundColor: token.colorBgLayout,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        {currentMainImage ? (
          <Image
            src={currentMainImage}
            alt={product.name || 'Product image'}
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Package style={{ fontSize: 64, color: token.colorTextQuaternary }} />
        )}
      </div>

      {/* Gallery Thumbnails */}
      {thumbnailImages.length > 0 && (
        <Flex gap="small" style={{ overflowX: 'auto', paddingBottom: 8 }}>
          {thumbnailImages.map((thumbnailImage, index) => {
            const isSelected = selectedImageIndex === index;
            return (
              <div
                key={`${thumbnailImage}-${index}`}
                onClick={() => handleThumbnailClick(index)}
                style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  borderRadius: token.borderRadius,
                  border: `2px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.7,
                  transition: 'all 0.3s'
                }}
                title={t('clickToView') || 'Click to view this image'}
              >
                <img
                  src={thumbnailImage}
                  alt={`${product.name || 'Product'} - Gallery ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            );
          })}
        </Flex>
      )}
    </div>
  );
};

export default ProductDetailsMedia;


