import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { validateImageUrl } from '../../Products/utils/securityHelpers';

/**
 * OptimizedImage Component
 * 
 * PERFORMANCE: Optimized image component with lazy loading and resizing support
 * - Lazy loads images below the fold
 * - Supports image resizing via query parameters
 * - Shows skeleton placeholder while loading
 */
const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    placeholderClassName = '',
    // PERFORMANCE: Optional image resizing for list views
    width,
    height,
    resize = false
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true); // Stop showing loading state
    };

    // SECURITY: Validate image URL to prevent XSS via malicious URLs
    // PERFORMANCE: Resize image URL if resize prop is true
    // WooCommerce supports image resizing via query parameters
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
            setIsLoaded(false);
        }
    }, [optimizedSrc, hasError]);

    return (
        <div className={`relative overflow-hidden ${className} ${!isLoaded ? 'bg-gray-100 animate-pulse' : ''}`}>
            {/* Placeholder / Loading State */}
            {!isLoaded && !hasError && (
                <div className={`absolute inset-0 flex items-center justify-center ${placeholderClassName}`}>
                    <PhotoIcon className="w-6 h-6 text-gray-300" />
                </div>
            )}

            {/* Error State */}
            {hasError ? (
                <div className={`absolute inset-0 flex items-center justify-center bg-gray-50 ${placeholderClassName}`}>
                    <PhotoIcon className="w-8 h-8 text-gray-300" />
                </div>
            ) : (
                /* Actual Image */
                <img
                    src={optimizedSrc}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
