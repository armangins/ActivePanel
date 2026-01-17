import React, { useEffect, useState } from 'react';
import { theme } from 'antd';

interface VariationImagePreviewProps {
    image: any;
    size?: number;
    showBorder?: boolean;
}

export const VariationImagePreview: React.FC<VariationImagePreviewProps> = ({
    image,
    size = 32,
    showBorder = false
}) => {
    const { token } = theme.useToken();
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!image) {
            setSrc(null);
            return;
        }

        if (typeof image === 'string') {
            setSrc(image);
            return;
        }

        if (image.url) {
            setSrc(image.url);
            return;
        }

        if (image.src) {
            setSrc(image.src);
            return;
        }

        // Handle File/Blob
        const file = image.originFileObj || image;
        if (file instanceof Blob || file instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSrc(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSrc(null);
        }
    }, [image]);

    if (!src) {
        return <span style={{ fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>-</span>;
    }

    return (
        <img
            src={src}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: token.borderRadius,
                objectFit: 'cover',
                display: 'block',
                border: showBorder ? `1px solid ${token.colorBorder}` : 'none'
            }}
            alt="var-img"
        />
    );
};
