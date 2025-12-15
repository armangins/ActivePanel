import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

/**
 * UserAvatar Component - Ant Design wrapper
 * 
 * Displays user profile picture with fallback placeholder using Ant Design Avatar.
 */
const UserAvatar = ({ 
  src, 
  alt = 'User', 
  name,
  size = 'md', // 'sm', 'md', 'lg', 'xl' or number
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const avatarSize = typeof size === 'number' ? size : (sizeMap[size] || sizeMap.md);

  // Reset error when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Validate src - must be a non-empty string URL
  const isValidPicture = src && typeof src === 'string' && src.trim().length > 0 && src.startsWith('http');

  // If no valid src or error, show placeholder
  if (!isValidPicture || imageError) {
    return (
      <Avatar
        size={avatarSize}
        icon={<UserOutlined />}
        className={className}
        title={name || alt}
        style={{ backgroundColor: '#4560FF' }}
      />
    );
  }

  return (
    <Avatar
      src={src.trim()}
      alt={alt}
      size={avatarSize}
      className={className}
      onError={() => setImageError(true)}
      icon={<UserOutlined />}
    />
  );
};

export default UserAvatar;
