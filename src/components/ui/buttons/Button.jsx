import React from 'react';
import PropTypes from 'prop-types';

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
                <svg className={`animate-spin ${children ? 'mr-2' : ''} h-4 w-4 text-current`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'link']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'icon']),
    isLoading: PropTypes.bool,
    icon: PropTypes.elementType,
    iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Button;
