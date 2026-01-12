import React from 'react';

interface SparklesIconProps {
    style?: React.CSSProperties;
    className?: string;
}

/**
 * SparklesIcon Component
 * 
 * Custom SVG icon for "Sparkles" / "Magic" effects.
 * Typically used for "Smart" or AI-powered features.
 */
export const SparklesIcon: React.FC<SparklesIconProps> = ({ style, className }) => {
    return (
        <svg
            viewBox="0 0 600 600"
            fill="currentColor"
            width="1em"
            height="1em"
            preserveAspectRatio="xMidYMid meet"
            style={style}
            className={className}
        >
            <path d="M107.5 318.75C194.375 318.75 265 248.125 265 161.25C265 248.125 335.625 318.75 422.5 318.75C335.625 318.75 265 389.375 265 476.25C265 389.375 194.375 318.75 107.5 318.75Z" />
            <path d="M338.75 162.5C382.812 162.5 418.125 127.188 418.125 83.125C418.125 127.188 453.438 162.5 497.5 162.5C453.438 162.5 418.125 197.812 418.125 241.875C418.125 197.812 382.812 162.5 338.75 162.5Z" />
            <path d="M338.75 468.75C382.812 468.75 418.125 433.438 418.125 389.375C418.125 433.438 453.438 468.75 497.5 468.75C453.438 468.75 418.125 504.062 418.125 548.125C418.125 504.062 382.812 468.75 338.75 468.75Z" />
        </svg>
    );
};
