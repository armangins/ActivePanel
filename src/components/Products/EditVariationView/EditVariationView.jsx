import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightOutlined as ArrowRightIcon, SaveOutlined as FloppyDiskIcon, CloseOutlined as X } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { variationsAPI, attributesAPI, productsAPI } from '../../../services/woocommerce';
import { Card, Breadcrumbs, Button } from '../../ui';
import { Input } from '../../ui/inputs';

const EditVariationView = () => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const { id, variationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variation, setVariation] = useState(null);
  const [formData, setFormData] = useState({
    regular_price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    stock_status: 'instock',
    image: null,
    attributes: {}, // { attributeId: termId }
  });
  const [errors, setErrors] = useState({});

  // Attributes state
  const [attributes, setAttributes] = useState([]);
  const [attributeTerms, setAttributeTerms] = useState({}); // { attributeId: terms[] }
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  useEffect(() => {
    if (id && variationId) {
      loadVariation(id, variationId);
      loadAttributes();
    }
  }, [id, variationId]);

  const loadAttributes = async () => {
    setLoadingAttributes(true);
    try {
      const attrs = await attributesAPI.getAll();
      setAttributes(attrs);
    } catch (err) {
      // Failed to load attributes
    } finally {
      setLoadingAttributes(false);
    }
  };

  const loadAttributeTerms = async (attributeId) => {
    // Only load terms if not already loaded
    if (attributeTerms[attributeId] !== undefined) return;

    try {
      const terms = await attributesAPI.getTerms(attributeId);
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: terms || []
      }));
    } catch (err) {
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: []
      }));
    }
  };

  const loadVariation = async (productId, varId) => {
    setLoading(true);
    try {
      const variationData = await variationsAPI.getById(productId, varId);
      setVariation(variationData);

      // Initialize attributes from variation
      const attributesMap = {};
      if (variationData.attributes && variationData.attributes.length > 0) {
        // Load terms for each attribute in the variation
        const termPromises = variationData.attributes.map(async (attr) => {
          await loadAttributeTerms(attr.id);
          // Find the term ID that matches the option name
          const terms = await attributesAPI.getTerms(attr.id);
          const matchingTerm = terms?.find(term => term.name === attr.option);
          if (matchingTerm) {
            attributesMap[attr.id] = matchingTerm.id;
          }
        });

        // Wait for all terms to load
        await Promise.all(termPromises);
      }

      setFormData({
        regular_price: variationData.regular_price || '',
        sale_price: variationData.sale_price || '',
        sku: variationData.sku || '',
        stock_quantity: variationData.stock_quantity?.toString() || '',
        stock_status: variationData.stock_status || 'instock',
        image: variationData.image || null,
        attributes: attributesMap,
      });
    } catch (err) {
      navigate(`/products/edit/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build attributes array for WooCommerce
      const variationAttributes = Object.keys(formData.attributes)
        .filter(attributeId => formData.attributes[attributeId])
        .map(attributeId => {
          const attribute = attributes.find(attr => attr.id === parseInt(attributeId));
          const termId = formData.attributes[attributeId];
          const term = attributeTerms[attributeId]?.find(t => t.id === termId);

          return {
            id: parseInt(attributeId),
            name: attribute.name,
            option: term ? term.name : ''
          };
        });

      const updateData = {
        attributes: variationAttributes,
        regular_price: formData.regular_price || '',
        sale_price: formData.sale_price || '',
        sku: formData.sku || '',
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : null,
        stock_status: formData.stock_status,
      };

      // Add image if available
      if (formData.image && formData.image.id) {
        updateData.image = { id: formData.image.id };
      }

      await variationsAPI.update(id, variationId, updateData);
      navigate(`/products/edit/${id}`);
    } catch (error) {
      setErrors({ submit: error.message || t('saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  const toggleAttributeTerm = (attributeId, termId) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: prev.attributes[attributeId] === termId ? null : termId
      }
    }));
  };



  const isTermSelected = (attributeId, termId) => {
    return formData.attributes[attributeId] === termId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading') || 'טוען...'}</p>
        </div>
      </div>
    );
  }

  if (!variation) {
    return null;
  }

  // Get variation attributes text
  const attributesText = variation.attributes && variation.attributes.length > 0
    ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
    : '';

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          t('dashboard'),
          t('products'),
          {
            label: variation?.parent_name || t('product'),
            onClick: () => navigate(`/products/edit/${id}`)
          },
          t('editVariation') || 'ערוך וריאציה'
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-row-reverse">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-right">
            {t('editVariation') || 'ערוך וריאציה'}
          </h1>
          {attributesText && (
            <p className="text-sm text-gray-600 mt-1 text-right">{attributesText}</p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/products/edit/${id}`)}
          className="flex items-center gap-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 flex-row-reverse"
        >
          <ArrowRightIcon className={`w-[18px] h-[18px] ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('back') || 'חזור'}</span>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Variation Image */}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  {t('image') || 'תמונה'}
                </label>
                <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={formData.image.src || formData.image.url}
                    alt={attributesText}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Regular Price */}
            <Input
              label={t('regularPrice')}
              required
              type="number"
              value={formData.regular_price}
              onChange={(e) => setFormData(prev => ({ ...prev, regular_price: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="text-right"
            />

            {/* Sale Price */}
            <Input
              label={t('salePrice')}
              type="number"
              value={formData.sale_price}
              onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="text-right"
            />

            {/* SKU */}
            <Input
              label={t('sku')}
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder={t('sku') || 'SKU'}
              className="text-right"
            />

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                {t('stockStatus')}
              </label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_status: e.target.value }))}
                className="input-field text-right w-full"
                dir="rtl"
              >
                <option value="instock">{t('inStock')}</option>
                <option value="outofstock">{t('outOfStock')}</option>
                <option value="onbackorder">{t('onBackorder')}</option>
              </select>
            </div>

            {/* Stock Quantity */}
            <Input
              label={t('stockQuantity')}
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              placeholder="0"
              min="0"
              className="text-right"
            />

            {/* Attributes Section */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-right">
                {t('attributes') || 'תכונות'}
              </label>

              {loadingAttributes ? (
                <div className="text-right py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 inline-block"></div>
                  <p className="text-sm text-gray-600 inline mr-2">{t('loading') || 'טוען...'}</p>
                </div>
              ) : attributes.length === 0 ? (
                <p className="text-sm text-gray-500 text-right">{t('noAttributes') || 'אין תכונות זמינות'}</p>
              ) : (
                <div className="space-y-6">
                  {/* Select attributes and terms */}
                  {attributes.map(attribute => {
                    const terms = attributeTerms[attribute.id];
                    const isLoadingTerms = terms === undefined;
                    const selectedTermId = formData.attributes[attribute.id];

                    return (
                      <div key={attribute.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
                          {attribute.name}
                        </label>
                        {isLoadingTerms ? (
                          <div className="text-right py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 inline-block"></div>
                            <p className="text-xs text-gray-500 inline mr-2">{t('loading') || 'טוען...'}</p>
                          </div>
                        ) : !terms || terms.length === 0 ? (
                          <p className="text-xs text-gray-500 text-right">
                            {t('noTermsAvailable') || 'אין אפשרויות זמינות לתכונה זו'}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {terms.map(term => (
                              <Button
                                key={term.id}
                                type="button"
                                onClick={() => toggleAttributeTerm(attribute.id, term.id)}
                                variant={isTermSelected(attribute.id, term.id) ? 'primary' : 'secondary'}
                                className={`px-4 py-2 rounded-lg transition-colors text-sm text-center h-auto ${isTermSelected(attribute.id, term.id)
                                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                                  }`}
                              >
                                {term.name}
                                {isTermSelected(attribute.id, term.id) && (
                                  <X className="w-3.5 h-3.5 inline mr-1" />
                                )}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm text-right">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-row-reverse pt-4">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
                className="px-6"
                icon={FloppyDiskIcon}
              >
                {t('save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/products/edit/${id}`)}
                className="px-6"
              >
                {t('cancel') || 'ביטול'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditVariationView;

