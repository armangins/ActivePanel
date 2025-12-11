/**
 * Calculate pricing information for a product
 * Handles both simple and variable products
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Currency formatting function
 * @param {Function} t - Translation function (optional, for fallback text)
 */
export const calculateProductPricing = (product, formatCurrency, t) => {
    const isVariable = product.type === 'variable';

    let displayPrice, formattedSalePrice, formattedRegularPrice, discountPercentage = 0;

    // PERFORMANCE: Handle variable products with or without variations loaded
    // If variations aren't loaded yet (for faster initial load), show placeholder
    if (isVariable) {
        // Check if variations are loaded (empty array means loaded but no variations)
        const hasVariationsData = product.variations !== undefined;
        const variationsArray = product.variations || [];
        
        if (hasVariationsData && variationsArray.length > 0) {
            // Calculate price ranges from variations
            // Use only regular_price - do not use 'price' field as it may include tax calculations
            const regularPrices = variationsArray
                .map(v => {
                    // Only use regular_price to avoid tax calculation discrepancies
                    const priceValue = v.regular_price || 0;
                    return parseFloat(priceValue);
                })
                .filter(p => p > 0);

            const salePrices = variationsArray
                .map(v => v.sale_price ? parseFloat(v.sale_price) : null)
                .filter(p => p !== null && p > 0);

            if (regularPrices.length > 0) {
                const minRegularPrice = Math.min(...regularPrices);
                const maxRegularPrice = Math.max(...regularPrices);

                // Check if any variations have sale prices
                if (salePrices.length > 0) {
                    const minSalePrice = Math.min(...salePrices);
                    const maxSalePrice = Math.max(...salePrices);

                    // Show sale price range
                    if (minSalePrice === maxSalePrice) {
                        displayPrice = formatCurrency(minSalePrice);
                    } else {
                        displayPrice = `${formatCurrency(minSalePrice)} - ${formatCurrency(maxSalePrice)}`;
                    }

                    // Show regular price range (for strikethrough)
                    if (minRegularPrice === maxRegularPrice) {
                        formattedRegularPrice = formatCurrency(minRegularPrice);
                    } else {
                        formattedRegularPrice = `${formatCurrency(minRegularPrice)} - ${formatCurrency(maxRegularPrice)}`;
                    }

                    formattedSalePrice = displayPrice;

                    // Calculate average discount percentage
                    const avgDiscount = ((minRegularPrice - minSalePrice) / minRegularPrice) * 100;
                    discountPercentage = Math.round(avgDiscount);
                } else {
                    // No sale prices, show regular price range
                    if (minRegularPrice === maxRegularPrice) {
                        displayPrice = formatCurrency(minRegularPrice);
                    } else {
                        displayPrice = `${formatCurrency(minRegularPrice)} - ${formatCurrency(maxRegularPrice)}`;
                    }
                formattedSalePrice = null;
                formattedRegularPrice = null;
                }
            } else {
                displayPrice = formatCurrency(0);
                formattedSalePrice = null;
                formattedRegularPrice = null;
            }
        } else {
            // Variations not loaded yet - show placeholder or parent price if available
            // This allows faster initial load, variations can be loaded on-demand
            const parentPrice = parseFloat(product.regular_price || 0);
            if (parentPrice > 0) {
                displayPrice = formatCurrency(parentPrice);
            } else {
                displayPrice = t?.('priceOnRequest') || 'מחיר לפי בקשה';
            }
            formattedSalePrice = null;
            formattedRegularPrice = null;
        }
    } else {
        // Simple product pricing
        // Use only regular_price - do not use 'price' field as it may include tax calculations
        const hasSalePrice = product.sale_price && parseFloat(product.sale_price) > 0;
        const regularPriceValue = parseFloat(product.regular_price || 0);
        const salePriceValue = hasSalePrice ? parseFloat(product.sale_price) : null;

        // Calculate discount percentage
        if (hasSalePrice && regularPriceValue > 0) {
            discountPercentage = Math.round(((regularPriceValue - salePriceValue) / regularPriceValue) * 100);
        }

        // Format prices
        displayPrice = formatCurrency(regularPriceValue);
        formattedSalePrice = salePriceValue ? formatCurrency(salePriceValue) : null;
        formattedRegularPrice = regularPriceValue > 0 ? formatCurrency(regularPriceValue) : null;
    }

    return {
        displayPrice,
        formattedSalePrice,
        formattedRegularPrice,
        discountPercentage
    };
};

import { validateImageUrl, sanitizeProductName, sanitizeSKU, validateProduct } from '../../utils/securityHelpers';

/**
 * Process product data for display in ProductCard
 * PERFORMANCE: Optimized to minimize processing time
 * SECURITY: Sanitizes all user-facing data to prevent XSS
 */
export const processProductForDisplay = (product, formatCurrency, t) => {
    // SECURITY: Validate product structure
    if (!validateProduct(product)) {
        console.warn('Invalid product object:', product);
        return null;
    }
    
    const isVariable = product.type === 'variable';

    // PERFORMANCE: Optimize image processing - only get first image for list view
    // SECURITY: Validate image URL to prevent XSS via malicious URLs
    // Gallery images can be loaded on-demand when viewing product details
    // Note: Image resizing is handled by OptimizedImage component for better performance
    const rawImageUrl = product.images?.[0]?.src || null;
    const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;

    // PERFORMANCE: Only process gallery images if product has multiple images
    // SECURITY: Validate all gallery image URLs
    // For list view, we don't need all gallery images immediately
    let galleryImages = [];
    if (product.images && product.images.length > 1) {
        // Only take first 3 gallery images for performance (can load more on-demand)
        // SECURITY: Validate each image URL to prevent XSS
        // Note: Image resizing is handled by OptimizedImage component
        galleryImages = product.images
            .slice(1, 4)
            .map(img => {
                const url = img.src || img.url || img.source_url;
                return url ? validateImageUrl(url) : null;
            })
            .filter(Boolean);
    }
    // PERFORMANCE: Variation images are not needed in list view
    // They can be loaded when viewing product details
    // Removed variation image processing for faster initial load

    // Basic info
    // SECURITY: Sanitize all user-facing strings to prevent XSS
    const productName = sanitizeProductName(product.name || t('productName'));
    const stockStatus = product.stock_status || 'instock';
    const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');
    const sku = product.sku ? `${t('sku')}: ${sanitizeSKU(product.sku)}` : null;

    // Pricing
    const pricing = calculateProductPricing(product, formatCurrency, t);

    return {
        id: product.id,
        product,
        imageUrl,
        galleryImages,
        productName,
        stockStatus,
        stockStatusLabel,
        sku,
        ...pricing,
        stockQuantity: product.stock_quantity
    };
};
