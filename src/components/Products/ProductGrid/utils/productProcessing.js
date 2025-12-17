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

            // Try to parse price_html if available to get regular/sale prices
            let parsedPrices = false;

            if (product.price_html) {
                // Check for del/ins structure: <del>...</del> <ins>...</ins>
                // WooCommerce wraps regular price in <del> and sale price in <ins>
                // Note: Check for both encoded (&lt;del&gt;) and decoded (<del>) versions

                const hasDel = product.price_html.includes('<del') || product.price_html.includes('&lt;del');
                const hasIns = product.price_html.includes('<ins') || product.price_html.includes('&lt;ins');

                if (hasDel && hasIns) {
                    // Extract numeric prices from del/ins elements
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(product.price_html, 'text/html');

                        const delElement = doc.querySelector('del');
                        const insElement = doc.querySelector('ins');

                        if (delElement && insElement) {
                            // Extract price from nested span.amount or bdi elements
                            const delPriceElement = delElement.querySelector('span.amount, bdi, .woocommerce-Price-amount');
                            const insPriceElement = insElement.querySelector('span.amount, bdi, .woocommerce-Price-amount');

                            if (delPriceElement && insPriceElement) {
                                formattedRegularPrice = delPriceElement.textContent.trim();
                                formattedSalePrice = insPriceElement.textContent.trim();
                            } else {
                                // Fallback: use regex to extract just the price
                                const delText = delElement.textContent.trim();
                                const insText = insElement.textContent.trim();

                                const delMatch = delText.match(/[\d,]+\.?\d*\s*[₪$€£¥ש״ח]/);
                                const insMatch = insText.match(/[\d,]+\.?\d*\s*[₪$€£¥ש״ח]/);

                                if (delMatch && insMatch) {
                                    formattedRegularPrice = delMatch[0].trim();
                                    formattedSalePrice = insMatch[0].trim();
                                }
                            }

                            // If we successfully parsed both, set display price to sale price
                            if (formattedRegularPrice && formattedSalePrice) {
                                displayPrice = formattedSalePrice;
                                parsedPrices = true;

                                // Calculate discount percentage
                                const regularPriceNum = parseFloat(formattedRegularPrice.replace(/[^\d.]/g, ''));
                                const salePriceNum = parseFloat(formattedSalePrice.replace(/[^\d.]/g, ''));
                                if (regularPriceNum > salePriceNum && salePriceNum > 0) {
                                    discountPercentage = Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100);
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing price_html with DOMParser', e);
                    }
                } else if (product.price_html) {
                    // If just a single price in HTML (no sale), it might still be formatted (e.g. range)
                    // Extract numeric price values only, not descriptive text
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(product.price_html, 'text/html');

                        // Try to find price in span.amount or bdi elements (WooCommerce structure)
                        const priceElements = doc.querySelectorAll('span.amount, bdi, .woocommerce-Price-amount');

                        if (priceElements.length > 0) {
                            // Check if this is a price range (multiple price elements)
                            if (priceElements.length >= 2) {
                                // Variable product with price range
                                const prices = Array.from(priceElements).map(el => el.textContent.trim());
                                // Get unique prices and sort them
                                const uniquePrices = [...new Set(prices)];

                                if (uniquePrices.length >= 2) {
                                    // Display as range: min - max
                                    displayPrice = `${uniquePrices[0]} - ${uniquePrices[uniquePrices.length - 1]}`;
                                    parsedPrices = true;
                                } else {
                                    // All variations have same price
                                    displayPrice = uniquePrices[0];
                                    parsedPrices = true;
                                }
                            } else {
                                // Single price (simple product or variable with one variation)
                                const priceText = priceElements[0].textContent.trim();
                                if (priceText) {
                                    displayPrice = priceText;
                                    parsedPrices = true;
                                }
                            }
                        } else {
                            // Fallback: try to extract just numbers and currency symbols
                            const allText = doc.body.textContent.trim();
                            // Match price patterns like "80.00 ₪" or "₪80.00" or "80.00 ש״ח"
                            const priceMatch = allText.match(/[\d,]+\.?\d*\s*[₪$€£¥ש״ח]/);
                            if (priceMatch) {
                                displayPrice = priceMatch[0].trim();
                                parsedPrices = true;
                            }
                        }
                    } catch (e) {
                        // Fallback
                        console.error('Error parsing price_html:', e);
                    }
                }
            }

            const parentRegularPrice = parseFloat(product.regular_price || 0);
            const parentPrice = parseFloat(product.price || 0);

            if (!parsedPrices) {
                if (parentRegularPrice > parentPrice && parentPrice > 0) {
                    // On Sale Logic using direct API values
                    displayPrice = formatCurrency(parentPrice);
                    formattedSalePrice = displayPrice;
                    formattedRegularPrice = formatCurrency(parentRegularPrice);

                    // Calculate discount
                    discountPercentage = Math.round(((parentRegularPrice - parentPrice) / parentRegularPrice) * 100);
                } else if (parentPrice > 0) {
                    // Regular Price logic (or range start)
                    displayPrice = formatCurrency(parentPrice);
                    formattedSalePrice = null;
                    formattedRegularPrice = null;
                } else if (parentRegularPrice > 0) {
                    displayPrice = formatCurrency(parentRegularPrice);
                    formattedSalePrice = null;
                    formattedRegularPrice = null;
                } else {
                    // Try to use 'price' field as fallback if others failed
                    if (product.price && parseFloat(product.price) > 0) {
                        displayPrice = formatCurrency(product.price);
                    } else {
                        displayPrice = t?.('priceOnRequest') || 'מחיר לפי בקשה';
                    }
                    formattedSalePrice = null;
                    formattedRegularPrice = null;
                }
            }
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
import { secureLog } from '../../../../utils/logger';

/**
 * Process product data for display in ProductCard
 * PERFORMANCE: Optimized to minimize processing time
 * SECURITY: Sanitizes all user-facing data to prevent XSS
 */
export const processProductForDisplay = (product, formatCurrency, t) => {
    // Handle SETUP_REQUIRED responses from backend
    if (product && product.code === 'SETUP_REQUIRED') {
        // Don't log as error - this is expected for new users without WooCommerce settings
        return null;
    }

    // SECURITY: Validate product structure
    if (!validateProduct(product)) {
        // Only log if it's not a SETUP_REQUIRED response
        if (!product || product.code !== 'SETUP_REQUIRED') {
            secureLog.warn('Invalid product object:', product);
        }
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
        displayPrice: pricing.displayPrice,
        salePrice: pricing.formattedSalePrice,
        regularPrice: pricing.formattedRegularPrice,
        discountPercentage: pricing.discountPercentage,
        stockQuantity: product.stock_quantity
    };
};
