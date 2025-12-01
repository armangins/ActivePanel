import { useState } from 'react';
import { TrashIcon as Trash2, XMarkIcon as X } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI } from '../../services/woocommerce';

const ProductBuilder = ({ onValidation, onProductsGenerated }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([createEmptyProduct()]);
  const [saving, setSaving] = useState(false);

  function createEmptyProduct() {
    return {
      name: '',
      type: 'simple',
      regular_price: '',
      sale_price: '',
      stock_quantity: '',
      sku: '',
      description: '',
      short_description: '',
      categories: [],
      tags: [],
      images: [],
      attributes: [],
      variations: [],
      meta_data: [],
    };
  }

  const addProduct = () => {
    setProducts([...products, createEmptyProduct()]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const addVariation = (productIndex) => {
    const updated = [...products];
    if (!updated[productIndex].variations) {
      updated[productIndex].variations = [];
    }
    updated[productIndex].variations.push({
      regular_price: '',
      sale_price: '',
      stock_quantity: '',
      sku: '',
      attributes: [],
    });
    setProducts(updated);
  };

  const addAttribute = (productIndex) => {
    const updated = [...products];
    if (!updated[productIndex].attributes) {
      updated[productIndex].attributes = [];
    }
    updated[productIndex].attributes.push({
      name: '',
      options: [],
    });
    setProducts(updated);
  };

  const addImage = (productIndex) => {
    const updated = [...products];
    if (!updated[productIndex].images) {
      updated[productIndex].images = [];
    }
    updated[productIndex].images.push({ src: '' });
    setProducts(updated);
  };

  const addMetaData = (productIndex) => {
    const updated = [...products];
    if (!updated[productIndex].meta_data) {
      updated[productIndex].meta_data = [];
    }
    updated[productIndex].meta_data.push({ key: '', value: '' });
    setProducts(updated);
  };

  const validateProducts = () => {
    const errors = [];
    const warnings = [];

    products.forEach((product, index) => {
      if (!product.name || product.name.trim() === '') {
        errors.push({
          product: index + 1,
          field: 'name',
          message: t('nameRequired') || 'שם המוצר חובה',
        });
      }

      if (product.type === 'variable' && (!product.variations || product.variations.length === 0)) {
        errors.push({
          product: index + 1,
          field: 'variations',
          message: t('variationsRequired') || 'מוצר משתנה חייב לכלול לפחות וריאציה אחת',
        });
      }

      if (product.regular_price && isNaN(parseFloat(product.regular_price))) {
        errors.push({
          product: index + 1,
          field: 'regular_price',
          message: t('invalidPrice') || 'מחיר לא תקין',
        });
      }

      product.images?.forEach((img, imgIndex) => {
        if (img.src && !img.src.match(/^https?:\/\//)) {
          warnings.push({
            product: index + 1,
            field: `images[${imgIndex}]`,
            message: t('invalidImageUrl') || 'כתובת תמונה לא תקינה',
          });
        }
      });
    });

    return { errors, warnings, isValid: errors.length === 0 };
  };

  const handleSave = async () => {
    const validation = validateProducts();
    onValidation(validation);

    if (!validation.isValid) {
      return;
    }

    setSaving(true);
    try {
      const createdProducts = [];
      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          const productData = {
            name: product.name,
            type: product.type,
            regular_price: product.regular_price || '',
            sale_price: product.sale_price || '',
            manage_stock: product.stock_quantity !== '',
            stock_quantity: product.stock_quantity || null,
            sku: product.sku || '',
            description: product.description || '',
            short_description: product.short_description || '',
            images: product.images?.filter(img => img.src).map(img => ({ src: img.src })) || [],
            attributes: product.attributes?.filter(attr => attr.name).map(attr => ({
              name: attr.name,
              options: attr.options || [],
            })) || [],
            meta_data: product.meta_data?.filter(meta => meta.key).map(meta => ({
              key: meta.key,
              value: meta.value,
            })) || [],
          };

          const created = await productsAPI.create(productData);
          createdProducts.push(created);
          successCount++;
        } catch (error) {
          errorCount++;
          // Error is handled by the error message display
        }
      }

      if (successCount > 0) {
        onProductsGenerated(createdProducts);
        alert(t('productsCreated') || `נוצרו ${successCount} מוצרים בהצלחה${errorCount > 0 ? `. ${errorCount} שגיאות.` : ''}`);
      } else {
        alert(t('errorCreatingProducts') || 'שגיאה ביצירת מוצרים');
      }
    } catch (error) {
      alert(t('errorCreatingProducts') || 'שגיאה ביצירת מוצרים: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-row-reverse">
        <button
          onClick={addProduct}
          className="btn-primary flex items-center gap-2 flex-row-reverse"
        >
          <Plus className="w-[18px] h-[18px]" />
          {t('addProduct') || 'הוסף מוצר'}
        </button>
      </div>

      {products.map((product, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('product')} {index + 1}
            </h3>
            {products.length > 1 && (
              <button
                onClick={() => removeProduct(index)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Trash2 className="w-[18px] h-[18px]" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('productName') || 'שם המוצר'} *
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                className="input-field"
                placeholder={t('enterProductName') || 'הכנס שם מוצר'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('productType') || 'סוג מוצר'}
              </label>
              <select
                value={product.type}
                onChange={(e) => updateProduct(index, 'type', e.target.value)}
                className="input-field"
              >
                <option value="simple">{t('simple') || 'פשוט'}</option>
                <option value="variable">{t('variable') || 'משתנה'}</option>
                <option value="grouped">{t('grouped') || 'קבוצה'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                SKU
              </label>
              <input
                type="text"
                value={product.sku}
                onChange={(e) => updateProduct(index, 'sku', e.target.value)}
                className="input-field"
                placeholder="SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('regularPrice') || 'מחיר רגיל'} (₪)
              </label>
              <input
                type="number"
                step="0.01"
                value={product.regular_price}
                onChange={(e) => updateProduct(index, 'regular_price', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('salePrice') || 'מחיר מבצע'} (₪)
              </label>
              <input
                type="number"
                step="0.01"
                value={product.sale_price}
                onChange={(e) => updateProduct(index, 'sale_price', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('stockQuantity') || 'כמות במלאי'}
              </label>
              <input
                type="number"
                value={product.stock_quantity}
                onChange={(e) => updateProduct(index, 'stock_quantity', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('shortDescription') || 'תיאור קצר'}
              </label>
              <textarea
                value={product.short_description}
                onChange={(e) => updateProduct(index, 'short_description', e.target.value)}
                className="input-field"
                rows="2"
                placeholder={t('enterShortDescription') || 'הכנס תיאור קצר'}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('description') || 'תיאור'}
              </label>
              <textarea
                value={product.description}
                onChange={(e) => updateProduct(index, 'description', e.target.value)}
                className="input-field"
                rows="4"
                placeholder={t('enterDescription') || 'הכנס תיאור מפורט'}
              />
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2 flex-row-reverse">
                <label className="block text-sm font-medium text-gray-700">
                  {t('images') || 'תמונות'}
                </label>
                <button
                  type="button"
                  onClick={() => addImage(index)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 flex-row-reverse"
                >
                  <ImageIcon className="w-4 h-4" />
                  {t('addImage') || 'הוסף תמונה'}
                </button>
              </div>
              {product.images?.map((img, imgIndex) => (
                <div key={imgIndex} className="flex gap-2 mb-2 flex-row-reverse">
                  <input
                    type="url"
                    value={img.src}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].images[imgIndex].src = e.target.value;
                      setProducts(updated);
                    }}
                    className="input-field flex-1"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...products];
                      updated[index].images = updated[index].images.filter((_, i) => i !== imgIndex);
                      setProducts(updated);
                    }}
                    className="text-orange-600"
                  >
                    <X className="w-[18px] h-[18px]" />
                  </button>
                </div>
              ))}
            </div>

            {/* Attributes */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2 flex-row-reverse">
                <label className="block text-sm font-medium text-gray-700">
                  {t('attributes') || 'תכונות'}
                </label>
                <button
                  type="button"
                  onClick={() => addAttribute(index)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {t('addAttribute') || 'הוסף תכונה'}
                </button>
              </div>
              {product.attributes?.map((attr, attrIndex) => (
                <div key={attrIndex} className="border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="flex gap-2 mb-2 flex-row-reverse">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => {
                        const updated = [...products];
                        updated[index].attributes[attrIndex].name = e.target.value;
                        setProducts(updated);
                      }}
                      className="input-field flex-1"
                      placeholder={t('attributeName') || 'שם תכונה (למשל: צבע)'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...products];
                        updated[index].attributes = updated[index].attributes.filter((_, i) => i !== attrIndex);
                        setProducts(updated);
                      }}
                      className="text-orange-600"
                    >
                      <X className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={attr.options?.join(', ') || ''}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].attributes[attrIndex].options = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setProducts(updated);
                    }}
                    className="input-field"
                    placeholder={t('attributeOptions') || 'ערכים מופרדים בפסיק (למשל: אדום, כחול, ירוק)'}
                  />
                </div>
              ))}
            </div>

            {/* Meta Data */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2 flex-row-reverse">
                <label className="block text-sm font-medium text-gray-700">
                  {t('customFields') || 'שדות מותאמים אישית'}
                </label>
                <button
                  type="button"
                  onClick={() => addMetaData(index)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {t('addField') || 'הוסף שדה'}
                </button>
              </div>
              {product.meta_data?.map((meta, metaIndex) => (
                <div key={metaIndex} className="flex gap-2 mb-2 flex-row-reverse">
                  <input
                    type="text"
                    value={meta.key}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].meta_data[metaIndex].key = e.target.value;
                      setProducts(updated);
                    }}
                    className="input-field flex-1"
                    placeholder={t('fieldName') || 'שם שדה'}
                  />
                  <input
                    type="text"
                    value={meta.value}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[index].meta_data[metaIndex].value = e.target.value;
                      setProducts(updated);
                    }}
                    className="input-field flex-1"
                    placeholder={t('fieldValue') || 'ערך'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...products];
                      updated[index].meta_data = updated[index].meta_data.filter((_, i) => i !== metaIndex);
                      setProducts(updated);
                    }}
                    className="text-orange-600"
                  >
                    <X className="w-[18px] h-[18px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3 flex-row-reverse">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 flex-row-reverse"
        >
          <Save className="w-[18px] h-[18px]" />
          {saving ? (t('saving') || 'שומר...') : (t('saveProducts') || 'שמור מוצרים')}
        </button>
      </div>
    </div>
  );
};

export default ProductBuilder;

