/**
 * CSV Processing Utilities
 * 
 * Handles CSV parsing, validation, and transformation to WooCommerce format
 */

/**
 * Validate CSV data
 */
export const validateCSVData = (products, mode = 'import') => {
  const errors = [];
  const warnings = [];

  products.forEach((product, index) => {
    // Required fields validation
    if (mode === 'update') {
      if (!product.sku && !product.id) {
        errors.push({
          product: index + 1,
          field: 'sku/id',
          message: 'SKU או ID נדרש לעדכון',
        });
      }
    } else {
      if (!product.name || product.name.trim() === '') {
        errors.push({
          product: index + 1,
          field: 'name',
          message: 'שם המוצר חובה',
        });
      }
    }

    // Price validation
    if (product.regular_price && isNaN(parseFloat(product.regular_price))) {
      errors.push({
        product: index + 1,
        field: 'regular_price',
        message: 'מחיר לא תקין',
      });
    }

    if (product.sale_price && isNaN(parseFloat(product.sale_price))) {
      errors.push({
        product: index + 1,
        field: 'sale_price',
        message: 'מחיר מבצע לא תקין',
      });
    }

    // Stock validation
    if (product.stock_quantity && isNaN(parseInt(product.stock_quantity))) {
      warnings.push({
        product: index + 1,
        field: 'stock_quantity',
        message: 'כמות במלאי לא תקינה',
      });
    }

    // Image URL validation
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img, imgIndex) => {
        if (img && !img.match(/^https?:\/\//)) {
          warnings.push({
            product: index + 1,
            field: `images[${imgIndex}]`,
            message: 'כתובת תמונה לא תקינה',
          });
        }
      });
    }
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
    totalProducts: products.length,
  };
};

/**
 * Transform CSV data to WooCommerce format
 */
export const transformToWooCommerce = (rows, headers, mapping, mode = 'import') => {
  return rows.map((row) => {
    const product = {};

    // Map each WooCommerce field
    Object.keys(mapping).forEach((fieldKey) => {
      const columnIndex = mapping[fieldKey];
      if (columnIndex !== undefined && row[columnIndex] !== undefined) {
        const value = row[columnIndex].trim();

        switch (fieldKey) {
          case 'name':
            product.name = value;
            break;
          case 'sku':
            product.sku = value;
            break;
          case 'id':
            product.id = parseInt(value) || null;
            break;
          case 'regular_price':
            product.regular_price = value;
            break;
          case 'sale_price':
            product.sale_price = value;
            break;
          case 'stock_quantity':
            product.stock_quantity = parseInt(value) || null;
            break;
          case 'description':
            product.description = value;
            break;
          case 'short_description':
            product.short_description = value;
            break;
          case 'categories':
            product.categories = value.split(',').map(c => c.trim()).filter(c => c);
            break;
          case 'tags':
            product.tags = value.split(',').map(t => t.trim()).filter(t => t);
            break;
          case 'images':
            product.images = value.split(',').map(img => ({
              src: img.trim(),
            })).filter(img => img.src);
            break;
          default:
            // Custom fields
            if (!product.meta_data) {
              product.meta_data = [];
            }
            product.meta_data.push({
              key: fieldKey,
              value: value,
            });
        }
      }
    });

    // Set default type
    if (!product.type) {
      product.type = 'simple';
    }

    return product;
  });
};

/**
 * Generate WooCommerce CSV format
 */
export const generateWooCommerceCSV = (products) => {
  // WooCommerce CSV headers - comprehensive list matching WooCommerce import format
  const headers = [
    'ID',
    'Type',
    'SKU',
    'Name',
    'Published',
    'Is featured?',
    'Visibility in catalog',
    'Short description',
    'Description',
    'Date sale price starts',
    'Date sale price ends',
    'Tax status',
    'Tax class',
    'In stock?',
    'Stock',
    'Low stock amount',
    'Backorders allowed?',
    'Backorders',
    'Sold individually?',
    'Weight (kg)',
    'Length (cm)',
    'Width (cm)',
    'Height (cm)',
    'Allow customer reviews?',
    'Purchase note',
    'Sale price',
    'Regular price',
    'Categories',
    'TagIcon as Tags',
    'Shipping class',
    'Images',
    'Download limit',
    'Download expiry days',
    'Parent',
    'Grouped products',
    'Upsells',
    'Cross-sells',
    'External URL',
    'Button text',
    'Position',
    'Attributes',
    'Meta data',
  ];

  const rows = products.map((product) => {
    return [
      product.id || '',
      product.type || 'simple',
      product.sku || '',
      product.name || '',
      product.published || '1',
      product.featured || '0',
      product.catalog_visibility || 'visible',
      product.short_description || '',
      product.description || '',
      product.date_on_sale_from || '',
      product.date_on_sale_to || '',
      product.tax_status || 'taxable',
      product.tax_class || '',
      product.stock_status === 'instock' ? '1' : '0',
      product.stock_quantity || '',
      product.low_stock_amount || '',
      product.backorders_allowed || '0',
      product.backorders || 'no',
      product.sold_individually || '0',
      product.weight || '',
      product.length || '',
      product.width || '',
      product.height || '',
      product.reviews_allowed || '1',
      product.purchase_note || '',
      product.sale_price || '',
      product.regular_price || '',
      product.categories || '',
      product.tags || '',
      product.shipping_class || '',
      product.images || '',
      product.download_limit || '',
      product.download_expiry || '',
      product.parent_id || '',
      product.grouped_products || '',
      product.upsell_ids || '',
      product.cross_sell_ids || '',
      product.external_url || '',
      product.button_text || '',
      product.position || '0',
      product.attributes || '',
      product.meta_data || '',
    ];
  });

  // Convert to CSV format with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes
      const cellValue = String(cell || '').replace(/"/g, '""');
      return `"${cellValue}"`;
    }).join(','))
  ].join('\n');

  return BOM + csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'woocommerce-products.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

