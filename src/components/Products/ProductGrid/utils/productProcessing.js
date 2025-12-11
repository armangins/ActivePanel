/**
 * Calculate pricing information for a product
 * Handles both simple and variable products
 */
export const calculateProductPricing = (product, formatCurrency) => {
    const isVariable = product.type === 'variable';

    let displayPrice, formattedSalePrice, formattedRegularPrice, discountPercentage = 0;

    if (isVariable && product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
        // Calculate price ranges from variations
        // Use only regular_price - do not use 'price' field as it may include tax calculations
        // The 'price' field in WooCommerce can be modified by tax settings, so we stick to regular_price
        const regularPrices = product.variations
            .map(v => {
                // Only use regular_price to avoid tax calculation discrepancies
                const priceValue = v.regular_price || 0;
                return parseFloat(priceValue);
            })
            .filter(p => p > 0);

        const salePrices = product.variations
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

/**
 * Process product data for display in ProductCard
 */
export const processProductForDisplay = (product, formatCurrency, t) => {
    const isVariable = product.type === 'variable';

    // Image processing
    const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;

    // For variable products, include variation images in gallery
    let galleryImages = [];
    if (product.images && product.images.length > 1) {
        galleryImages = product.images.slice(1).map(img => img.src || img.url || img.source_url).filter(Boolean);
    }
    // Add variation images if available
    if (isVariable && product.variations && Array.isArray(product.variations)) {
        const variationImages = product.variations
            .map(v => v.image?.src)
            .filter(Boolean);
        galleryImages = [...galleryImages, ...variationImages];
    }

    // Basic info
    const productName = product.name || t('productName');
    const stockStatus = product.stock_status || 'instock';
    const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');
    const sku = product.sku ? `${t('sku')}: ${product.sku}` : null;

    // Pricing
    const pricing = calculateProductPricing(product, formatCurrency);

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
