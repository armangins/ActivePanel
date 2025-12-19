import React from 'react';
import { Typography, Space } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import DOMPurify from 'dompurify';

const { Text } = Typography;

interface PriceDisplayProps {
    price: string | number;
    regular_price?: string | number;
    sale_price?: string | number;
    price_html?: string;
    currency?: string;
    type?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price: rawPrice,
    regular_price: rawRegularPrice,
    sale_price: rawSalePrice,
    price_html: rawPriceHtml,
    currency: rawCurrency = '',
    type = 'simple'
}) => {
    const { formatCurrency } = useLanguage();

    // STRICT SANITIZATION HELPER
    const sanitize = (val: any): string | null => {
        if (val === null || val === undefined) return null;
        const s = String(val).trim();
        if (s === 'undefined' || s === 'null' || s === '') return null;
        return s;
    };

    // Clean all inputs once
    const price = sanitize(rawPrice);
    const regular_price = sanitize(rawRegularPrice);
    const sale_price = sanitize(rawSalePrice);
    const price_html = sanitize(rawPriceHtml);
    const currency = sanitize(rawCurrency) || '';

    // Helper to check if a value is numeric
    const isNumeric = (val: any) => val !== null && !isNaN(parseFloat(val)) && isFinite(val);

    // Helper to format a range string "min - max"
    const formatRange = (rangeStr: string) => {
        if (!rangeStr) return '';
        const parts = rangeStr.split('-').map(p => p.trim());
        if (parts.length === 2 && isNumeric(parts[0]) && isNumeric(parts[1])) {
            return `${formatCurrency(parts[0])} - ${formatCurrency(parts[1])}`;
        }
        return rangeStr; // Fallback to original string
    };

    // Helper to strip HTML tags (kept for non-variable fallback if needed)
    const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '').trim();
    };

    // Helper to clean WooCommerce HTML noise (screen-reader text, etc.) AND Sanitize
    const cleanWooHtml = (html: string) => {
        if (!html) return '';

        // 1. Sanitize HTML to prevent XSS (Rule 25)
        const sanitized = DOMPurify.sanitize(html);

        // 2. Remove screen reader text spans which cause display clutter
        return sanitized
            .replace(/<span[^>]*class=["'][^"']*screen-reader-text[^"']*["'][^>]*>.*?<\/span>/gi, '')
            .trim();
    };

    // If we have no price at all, and no price_html, return null
    if (!price && !regular_price && !price_html) return null;

    // 1. Variable Product Logic - PRIORITIZE price_html
    // If it is a variable product and we have the HTML representation (which includes ranges/sales), use it.
    if (type === 'variable' && price_html) {
        return (
            <div
                className="price-display-variable"
                dangerouslySetInnerHTML={{ __html: cleanWooHtml(price_html) }}
                style={{
                    // Basic styling to ensure it fits reasonably well with Ant Design Text
                    fontSize: '14px',
                    fontWeight: 600,
                    // Ensure del tags look correct
                    textDecoration: 'none'
                }}
            />
        );
    }

    // 2. Range Logic (Legacy fallback for non-variable products that might look like ranges)
    const isVariableLike = (price && price.includes('-')) || (regular_price && regular_price.includes('-'));

    if (isVariableLike && !(price && isNumeric(price))) {
        // Fallback for missing price in variable product: use regular_price or price_html
        const effectivePrice = price || regular_price;

        if (!effectivePrice) {
            if (price_html) {
                return <Text strong>{stripHtml(price_html)}</Text>;
            }
            return null;
        }

        const formattedPrice = formatRange(effectivePrice);
        return <Text strong>{formattedPrice}</Text>;
    }

    // 3. Sale Price Logic (Simple / Uniform Variable)
    if (sale_price && isNumeric(sale_price)) {
        return (
            <Space align="baseline" size={4}>
                <Text strong type="danger">
                    {formatCurrency(sale_price)}
                </Text>
                {regular_price && isNumeric(regular_price) && (
                    <Text delete type="secondary" style={{ fontSize: '0.9em' }}>
                        {formatCurrency(regular_price)}
                    </Text>
                )}
            </Space>
        );
    }

    // 4. Standard Price Logic
    // Use price, or fallback to regular_price
    const displayPrice = isNumeric(price) ? price : (isNumeric(regular_price) ? regular_price : null);

    if (displayPrice !== null) {
        return <Text strong>{formatCurrency(displayPrice)}</Text>;
    }

    // 5. Fallback for non-numeric strings (e.g. "Free", "Contact us")
    if (price) {
        return <Text strong>{price} {currency}</Text>;
    }

    // 6. Last resort: price_html (stripped)
    if (price_html) {
        return <Text strong>{stripHtml(price_html)}</Text>;
    }

    return null;
};
