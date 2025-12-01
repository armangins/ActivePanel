import { UserIcon as User } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

/**
 * UserAvatar Component
 * 
 * Displays user profile picture with fallback placeholder
 * Handles image loading errors gracefully
 */
const UserAvatar = ({ 
  src, 
  alt = 'User', 
  name,
  size = 'md', // 'sm' (6), 'md' (8), 'lg' (10), 'xl' (12)
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Size mapping
  const sizeMap = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    xl: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  };

  const sizeClasses = sizeMap[size] || sizeMap.md;

  // Reset error when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  // Validate src - must be a non-empty string URL
  const isValidPicture = src && typeof src === 'string' && src.trim().length > 0 && src.startsWith('http');

  // If no valid src or error, show placeholder
  if (!isValidPicture || imageError) {
    return (
      <div 
        className={`${sizeClasses.container} bg-primary-100 rounded-full flex items-center justify-center ${className}`}
        title={name || alt}
      >
        <User className={`${sizeClasses.icon} text-primary-500`} />
      </div>
    );
  }

  return (
    <img
      src={src.trim()}
      alt={alt}
      className={`${sizeClasses.container} rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity ${className}`}
      onError={() => {
        setImageError(true);
        setImageLoading(false);
      }}
      onLoad={() => {
        setImageLoading(false);
        setImageError(false);
      }}
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
};

export default UserAvatar;

