import React from 'react';
import { useAttributeTerms } from '@/hooks/useAttributes';
import { Spin } from 'antd';

interface ColorSwatchProps {
    attributeId: number | string;
    colorName: string;
}

/**
 * Component that fetches color data for an attribute term and displays a color swatch
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({ attributeId, colorName }) => {
    const { data: terms, isLoading } = useAttributeTerms(
        typeof attributeId === 'number' ? attributeId : undefined
    );

    if (isLoading) {
        return <Spin size="small" />;
    }

    // Find the term that matches the color name
    const term = terms?.find((t: any) => t.name === colorName);
    const colorValue = term?.color;

    if (!colorValue) {
        // If no color value found, show text instead
        return <span>{colorName}</span>;
    }

    return (
        <div
            title={colorName}
            style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: colorValue,
                border: '2px solid #d9d9d9',
                flexShrink: 0,
                cursor: 'help'
            }}
        />
    );
};
