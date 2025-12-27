import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import type { CarouselRef } from 'antd/es/carousel';

interface ProductImageCarouselProps {
    images: { src: string }[];
    productName: string;
}

export const ProductImageCarousel = ({ images, productName }: ProductImageCarouselProps) => {
    const carouselRef = useRef<CarouselRef>(null);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        carouselRef.current?.prev();
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        carouselRef.current?.next();
    };

    const buttonStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        width: 28, // Smaller button
        height: 28, // Smaller button
        minWidth: 28, // Prevent shrinking
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        opacity: 0, // Hidden by default
        transition: 'opacity 0.3s ease',
    };

    return (
        <div
            style={{ position: 'relative' }}
            className="product-image-carousel"
            onMouseEnter={(e) => {
                const buttons = e.currentTarget.querySelectorAll('.carousel-nav-btn');
                buttons.forEach(btn => (btn as HTMLElement).style.opacity = '1');
            }}
            onMouseLeave={(e) => {
                const buttons = e.currentTarget.querySelectorAll('.carousel-nav-btn');
                buttons.forEach(btn => (btn as HTMLElement).style.opacity = '0');
            }}
        >
            <Carousel ref={carouselRef} dots={false} infinite>
                {images.map((image, index) => (
                    <div key={index}>
                        <img
                            alt={`${productName} - ${index + 1}`}
                            src={image.src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f2f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="48" fill="%23bfbfbf"%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E'}
                            style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                objectFit: 'cover',
                                pointerEvents: 'none', // Prevent image drag/click issues inside carousel
                            }}
                        />
                    </div>
                ))}
            </Carousel>

            <Button
                className="carousel-nav-btn"
                shape="circle"
                icon={<LeftOutlined style={{ fontSize: 12 }} />}
                onClick={handlePrev}
                style={{ ...buttonStyle, left: 8 }}
            />
            <Button
                className="carousel-nav-btn"
                shape="circle"
                icon={<RightOutlined style={{ fontSize: 12 }} />}
                onClick={handleNext}
                style={{ ...buttonStyle, right: 8 }}
            />
        </div>
    );
};
