import { useState } from 'react';
import { InboxOutlined as Package, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { theme, Carousel } from 'antd';
import { OptimizedImage } from '../../ui';

const ProductCardImage = ({
    imageUrl,
    galleryImages = [],
    productName,
}) => {
    const { token } = theme.useToken();
    const [isHovered, setIsHovered] = useState(false);

    // Combine all images: main image + gallery images
    const allImages = imageUrl ? [imageUrl, ...galleryImages] : galleryImages;
    const hasMultipleImages = allImages.length > 1;

    const renderImage = (src, index) => (
        <div
            key={`${src}-${index}`}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                overflow: 'hidden',
                position: 'relative' // Ensure relative for any absolute children if needed
            }}
        >
            <OptimizedImage
                src={src}
                alt={`${productName} - ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                resize={false}
            />
        </div>
    );

    // Custom Arrow Component
    const CustomArrow = ({ currentSlide, slideCount, direction, onClick, style, className }) => {
        // Only show if hovered
        if (!isHovered) return null;

        const isLeft = direction === 'left';

        return (
            <div
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onClick && onClick(e);
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    [isLeft ? 'left' : 'right']: 10,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: token.colorText,
                    transition: 'all 0.3s',
                }}
                className="custom-slick-arrow"
            >
                {isLeft ? <LeftOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
            </div>
        );
    };

    return (
        <div
            style={{ width: '100%' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Image Area */}
            <div style={{
                width: '100%',
                position: 'relative',
                backgroundColor: token.colorFillQuaternary,
                borderTopLeftRadius: token.borderRadiusLG,
                borderTopRightRadius: token.borderRadiusLG,
                overflow: 'hidden',
                aspectRatio: '1',
            }}>
                {allImages.length > 0 ? (
                    hasMultipleImages ? (
                        <Carousel
                            dots={{ className: 'custom-dots' }}
                            style={{ width: '100%', height: '100%' }}
                            autoplay={false}
                            draggable={true}
                            arrows={true}
                            prevArrow={<CustomArrow direction="left" />}
                            nextArrow={<CustomArrow direction="right" />}
                        >
                            {allImages.map((img, index) => renderImage(img, index))}
                        </Carousel>
                    ) : (
                        renderImage(allImages[0], 0)
                    )
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
        </div>
    );
};
export default ProductCardImage;

