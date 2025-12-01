import { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

const OptimizedImage = ({ src, alt, className = '', placeholderClassName = '' }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true); // Stop showing loading state
    };

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
                    src={src}
                    alt={alt}
                    loading="lazy"
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
