import React, { useState, useEffect } from 'react';
import { Image, Space } from 'antd';
import './ProductDetailModal.css';

interface ProductImageGalleryProps {
    product: any;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (product?.images && product.images.length > 0) {
            setSelectedImage(product.images[0].src);
        } else {
            setSelectedImage(null);
        }
    }, [product]);

    const hasImages = product.images && product.images.length > 0;
    const hasThumbnails = hasImages && product.images.length > 1;

    return (
        <React.Fragment>
            <div className={`product-image-wrapper ${hasThumbnails ? 'has-thumbnails' : ''}`}>
                {hasImages ? (
                    <Image
                        src={selectedImage || product.images[0].src}
                        alt={product.name}
                        className="product-image"
                    />
                ) : (
                    <div className="product-image-placeholder"></div>
                )}
            </div>

            {/* Thumbnails */}
            {hasThumbnails && (
                <div className="thumbnail-container">
                    <Space size={8}>
                        {product.images.map((img: any, index: number) => (
                            <div
                                key={index}
                                className={`thumbnail-item ${selectedImage === img.src ? 'active' : ''}`}
                                onClick={() => setSelectedImage(img.src)}
                            >
                                <img
                                    src={img.src}
                                    alt={`thumbnail-${index}`}
                                    className="thumbnail-image"
                                />
                            </div>
                        ))}
                    </Space>
                </div>
            )}
        </React.Fragment>
    );
};
