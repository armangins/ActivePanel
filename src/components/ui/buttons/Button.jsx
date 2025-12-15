import React from 'react';
import { Button as AntButton } from 'antd';
import PropTypes from 'prop-types';

/**
 * Button Component - Ant Design wrapper
 * 
 * Maps custom button props to Ant Design Button props
 */
const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    type = 'button',
    onClick,
    ...props
}, ref) => {
    // Map variants to Ant Design button types
    const variantMap = {
        primary: 'primary',
        secondary: 'default',
        danger: 'primary', // Will use danger prop
        ghost: 'text',
        link: 'link',
        outline: 'default',
    };

    // Map sizes
    const sizeMap = {
        xs: 'small',
        sm: 'small',
        md: 'middle',
        lg: 'large',
        icon: 'middle',
    };

    const antType = variant === 'danger' ? 'primary' : variantMap[variant] || 'default';
    const antSize = sizeMap[size] || 'middle';

    // Handle icon positioning
    const iconNode = Icon ? (React.isValidElement(Icon) ? Icon : <Icon />) : null;

    // Don't set ghost prop if type is 'text' or 'link' (Ant Design doesn't allow it)
    const shouldUseGhost = variant === 'ghost' && antType !== 'text' && antType !== 'link';

    return (
        <AntButton
            ref={ref}
            type={antType}
            size={antSize}
            loading={isLoading}
            disabled={disabled || isLoading}
            danger={variant === 'danger'}
            ghost={shouldUseGhost}
            icon={iconPosition === 'left' ? iconNode : undefined}
            onClick={onClick}
            htmlType={type}
            className={className}
            {...props}
        >
            {iconPosition === 'right' && iconNode}
            {children}
        </AntButton>
    );
});

Button.displayName = 'Button';

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'link', 'outline']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'icon']),
    isLoading: PropTypes.bool,
    icon: PropTypes.oneOfType([
        PropTypes.elementType,
        PropTypes.element
    ]),
    iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Button;
