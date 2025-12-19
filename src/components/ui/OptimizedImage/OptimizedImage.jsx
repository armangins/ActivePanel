import { useState, useEffect } from 'react';
import { Image } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { validateImageUrl } from '@/utils/security';

/**
 * OptimizedImage Component - Ant Design wrapper
 * 
 * Optimized image component with lazy loading and resizing support using Ant Design Image.
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    placeholderClassName = '',
    width,
    height,
    resize = false
}) => {
    const [hasError, setHasError] = useState(false);

    // SECURITY: Validate image URL to prevent XSS via malicious URLs
    // PERFORMANCE: Resize image URL if resize prop is true
    const getOptimizedImageUrl = (originalUrl) => {
        if (!originalUrl) return null;

        // SECURITY: Validate URL before processing
        const validatedUrl = validateImageUrl(originalUrl);
        if (!validatedUrl) {
            return null;
        }

        // If resize is requested, add resize parameters
        if (resize && (width || height)) {
            const separator = validatedUrl.includes('?') ? '&' : '?';
            const params = [];
            if (width) params.push(`w=${width}`);
            if (height) params.push(`h=${height}`);
            params.push('fit=crop'); // Maintain aspect ratio with crop
            return `${validatedUrl}${separator}${params.join('&')}`;
        }

        return validatedUrl;
    };

    const optimizedSrc = getOptimizedImageUrl(src);

    // SECURITY: Reset error state if src changes to a valid URL
    useEffect(() => {
        if (optimizedSrc && hasError) {
            setHasError(false);
        }
    }, [optimizedSrc, hasError]);

    if (hasError || !optimizedSrc) {
        return (
            <div className={className} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                minHeight: height || 100,
                minWidth: width || 100
            }}>
                <PictureOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
            </div>
        );
    }

    return (
        <Image
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            loading="lazy"
            preview={false}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNkOWQ5ZDkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5CgPC90ZXh0Pjwvc3ZnPg=="
            onError={() => setHasError(true)}
        />
    );
};

export default OptimizedImage;
