import React from 'react';
import PropTypes from 'prop-types';
import { LoaderIcon } from '../../icons/LoaderIcon';

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
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto shadow-none',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    };

    const sizes = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            ref={ref}
            {...props}
        >
            {isLoading && (
                <LoaderIcon
                    size={16}
                    autoplay={true}
                    className={`${children ? 'mr-2' : ''} text-current`}
                />
            )}
            {!isLoading && Icon && iconPosition === 'left' && (
                <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} aria-hidden="true" />
            )}
            {children}
            {!isLoading && Icon && iconPosition === 'right' && (
                <Icon className={`w-5 h-5 ${children ? 'ml-2' : ''}`} aria-hidden="true" />
            )}
        </button>
    );
});

Button.displayName = 'Button';

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'link', 'outline']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'icon']),
    isLoading: PropTypes.bool,
    icon: PropTypes.elementType,
    iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Button;
