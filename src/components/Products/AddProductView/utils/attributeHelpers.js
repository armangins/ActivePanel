/**
 * Attribute Helper Utilities
 * 
 * Pure functions for working with product attributes and terms
 */

/**
 * Check if an attribute is a color attribute
 * @param {Object} attribute - Attribute object
 * @returns {boolean} - True if attribute is a color attribute
 */
export const isColorAttribute = (attribute) => {
  // Check if attribute type is explicitly set to 'color' in WooCommerce
  if (attribute.type === 'color' || attribute.attribute_type === 'color') {
    return true;
  }

  const name = attribute.name?.toLowerCase() || '';
  const slug = attribute.slug?.toLowerCase() || '';
  return name.includes('color') || 
         name.includes('צבע') || 
         slug.includes('color') || 
         slug.includes('pa_color');
};

/**
 * Get color value from term (hex code or image URL)
 * @param {Object} term - Attribute term object
 * @returns {Object|null} - Object with type ('color' or 'image') and value, or null
 */
export const getColorValue = (term) => {
  // Check for color code in meta data (WooCommerce stores color codes in meta)
  if (term.meta) {
    // Check if meta is an object
    if (typeof term.meta === 'object' && !Array.isArray(term.meta)) {
      // Check common WooCommerce color meta keys (priority order)
      const colorCode = term.meta.color || 
                       term.meta.pa_color || 
                       term.meta.product_attribute_color ||
                       term.meta.swatches_color ||
                       term.meta.term_color;

      if (colorCode) {
        // Ensure it's a valid hex color
        const hexMatch = colorCode.toString().match(/#?([0-9A-F]{6}|[0-9A-F]{3})/i);
        if (hexMatch) {
          return { type: 'color', value: '#' + hexMatch[1] };
        }
      }

      // Check for color image/swatch image
      const colorImage = term.meta.color_image || 
                        term.meta.image || 
                        term.meta.swatches_image ||
                        term.meta.term_image;
      if (colorImage) {
        return { type: 'image', value: colorImage };
      }
    }

    // Check if meta is an array (WooCommerce REST API format)
    if (Array.isArray(term.meta) && term.meta.length > 0) {
      // Look for color code in meta array
      const colorMeta = term.meta.find(m => 
        m.value && (
          m.key === 'color' || 
          m.key === 'pa_color' || 
          m.key === 'product_attribute_color' ||
          m.key === 'swatches_color' ||
          m.key === 'term_color'
        )
      );
      if (colorMeta && colorMeta.value) {
        const hexMatch = colorMeta.value.toString().match(/#?([0-9A-F]{6}|[0-9A-F]{3})/i);
        if (hexMatch) {
          return { type: 'color', value: '#' + hexMatch[1] };
        }
      }

      // Look for color image in meta array
      const imageMeta = term.meta.find(m => 
        m.value && (
          m.key === 'color_image' || 
          m.key === 'image' || 
          m.key === 'swatches_image' ||
          m.key === 'term_image'
        )
      );
      if (imageMeta && imageMeta.value) {
        return { type: 'image', value: imageMeta.value };
      }
    }
  }

  // Check for color code directly on term (some plugins store it here)
  if (term.color) {
    const hexMatch = term.color.toString().match(/#?([0-9A-F]{6}|[0-9A-F]{3})/i);
    if (hexMatch) {
      return { type: 'color', value: '#' + hexMatch[1] };
    }
  }

  // Check for color image directly on term
  if (term.image) {
    return { type: 'image', value: term.image };
  }

  // Check for color code in description
  if (term.description) {
    const hexMatch = term.description.match(/#([0-9A-F]{6}|[0-9A-F]{3})/i);
    if (hexMatch) {
      return { type: 'color', value: hexMatch[0] };
    }
  }

  // Fallback to common color names mapping
  const colorMap = {
    'red': '#FF9500', 'אדום': '#FF9500',
    'blue': '#0000FF', 'כחול': '#0000FF',
    'green': '#00FF00', 'ירוק': '#00FF00',
    'yellow': '#FFFF00', 'צהוב': '#FFFF00',
    'black': '#000000', 'שחור': '#000000',
    'white': '#FFFFFF', 'לבן': '#FFFFFF',
    'gray': '#808080', 'אפור': '#808080', 'grey': '#808080',
    'orange': '#FFA500', 'כתום': '#FFA500',
    'purple': '#800080', 'סגול': '#800080',
    'pink': '#FFC0CB', 'ורוד': '#FFC0CB',
    'brown': '#A52A2A', 'חום': '#A52A2A',
  };
  const termName = term.name?.toLowerCase() || '';
  const colorValue = colorMap[termName];
  return colorValue ? { type: 'color', value: colorValue } : null;
};

/**
 * Map product attributes to selected attribute terms
 * @param {Array} productAttributes - Product attributes from API
 * @param {Function} getTerms - Function to get terms for an attribute ID
 * @returns {Promise<Object>} - Map of attributeId to array of term IDs
 */
export const mapProductAttributesToTerms = async (productAttributes, getTerms) => {
  const termsMap = {};

  for (const attr of productAttributes) {
    if (attr.options && attr.options.length > 0) {
      const terms = await getTerms(attr.id);
      const termIds = [];

      for (const option of attr.options) {
        const term = terms?.find(t => t.name === option || t.slug === option);
        if (term) {
          termIds.push(term.id);
        }
      }

      if (termIds.length > 0) {
        termsMap[attr.id] = termIds;
      }
    }
  }

  return termsMap;
};













