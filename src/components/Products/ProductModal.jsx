import { useState, useEffect, useMemo } from 'react';
import { CubeIcon as Package, Image as ImageIcon, ArrowUpTrayIcon, TrashIcon, PlusIcon as Plus, XMarkIcon as X, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { UploadIcon } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI, categoriesAPI, attributesAPI, mediaAPI } from '../../services/woocommerce';
import ProductModalHeader from './ProductModal/ProductModalHeader';
import ProductModalGeneralStep from './ProductModal/ProductModalGeneralStep';
import ProductModalImagesStep from './ProductModal/ProductModalImagesStep';
import ProductModalAttributesStep from './ProductModal/ProductModalAttributesStep';
import ProductModalFooter from './ProductModal/ProductModalFooter';

const ProductModal = ({ product, onClose, onSave }) => {
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    type: product?.type || 'simple',
    name: product?.name || '',
    regular_price: product?.regular_price || product?.price || '',
    sale_price: product?.sale_price || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    stock_status: product?.stock_status || 'instock',
    categories: product?.categories?.map(c => c.id) || [],
    images: product?.images || [],
    attributes: product?.attributes || [],
    variations: product?.variations || [],
    weight: product?.weight || '',
    length: product?.dimensions?.length || '',
    width: product?.dimensions?.width || '',
    height: product?.dimensions?.height || '',
    tags: product?.tags?.map(t => ({ id: t.id, name: t.name })) || [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAttributes();
  }, []);

  // Update formData when product prop changes (when editing)
  useEffect(() => {
    if (product) {
      setFormData({
        type: product.type || 'simple',
        name: product.name || '',
        regular_price: product.regular_price || product.price || '',
        sale_price: product.sale_price || '',
        sku: product.sku || '',
        stock_quantity: product.stock_quantity || '',
        description: product.description || '',
        short_description: product.short_description || '',
        stock_status: product.stock_status || 'instock',
        categories: product.categories?.map(c => c.id) || [],
        images: product.images || [],
        attributes: product.attributes || [],
        variations: product.variations || [],
        weight: product.weight || '',
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || '',
        tags: product.tags?.map(t => ({ id: t.id, name: t.name })) || [],
      });
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setAllCategories(data);
      } catch (err) {
        // Failed to load categories
      }
  };

  const loadAttributes = async () => {
    try {
      const data = await attributesAPI.getAll();
      setAllAttributes(data);
      } catch (err) {
        // Failed to load attributes
      }
  };

  const loadAttributeTerms = async (attributeId, attrIndex) => {
    if (!attributeId || attributeId === 0) return;
    try {
      const terms = await attributesAPI.getTerms(attributeId);
      const updated = [...formData.attributes];
      updated[attrIndex].options = terms.map(t => t.name);
      setFormData({ ...formData, attributes: updated });
      } catch (err) {
        // Failed to load attribute terms
      }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setUploadError(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(t('invalidImageFile') || 'Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError(t('fileTooLarge') || 'Image size should be less than 10MB.');
      return;
    }

    setUploadError(null);
    setUploadingImage(true);
    
    try {
      const uploadedImage = await mediaAPI.upload(file);
      setFormData({
        ...formData,
        images: [...formData.images, { id: uploadedImage.id, src: uploadedImage.source_url }],
      });
      // Clear any previous errors on success
      setUploadError(null);
      // Reset the input field to allow uploading the same file again
      e.target.value = '';
    } catch (err) {
      setUploadError(err.message || t('uploadFailed') || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (imageId) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img.id !== imageId),
    });
  };

  const setFeaturedImage = (imageId) => {
    const image = formData.images.find(img => img.id === imageId);
    if (image) {
      setFormData({
        ...formData,
        images: [image, ...formData.images.filter(img => img.id !== imageId)],
      });
    }
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [
        ...formData.attributes,
        { id: 0, name: '', options: [], variation: false, visible: true },
      ],
    });
  };

  const updateAttribute = (index, field, value) => {
    const updated = [...formData.attributes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, attributes: updated });
  };

  const removeAttribute = (index) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const addAttributeOption = (index, option) => {
    const updated = [...formData.attributes];
    if (!updated[index].options) updated[index].options = [];
    updated[index].options = [...updated[index].options, option];
    setFormData({ ...formData, attributes: updated });
  };

  const removeAttributeOption = (attrIndex, optionIndex) => {
    const updated = [...formData.attributes];
    updated[attrIndex].options = updated[attrIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, attributes: updated });
  };

  const steps = [
    // Step 1: Product details
    { id: 'general', label: 'פרטי מוצר', icon: Package },
    // Step 2: Images
    { id: 'media', label: 'תמונות', icon: ImageIcon },
    // Step 3: Attributes & variations (and shipping section in the form)
    { id: 'shipping', label: 'תכונות ווריאציות', icon: Package },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow submission on the last step
    if (currentStep < steps.length - 1) {
      return;
    }
    
    if (!validateStep(currentStep)) {
      return;
    }
    setSaving(true);

    try {
      // Prepare product data for WooCommerce API
      const productData = {
        type: formData.type,
        name: formData.name,
        regular_price: formData.regular_price,
        sale_price: formData.sale_price || '',
        sku: formData.sku || '',
        manage_stock: formData.stock_quantity !== '',
        stock_quantity: formData.stock_quantity || null,
        stock_status: formData.stock_status,
        description: formData.description,
        short_description: formData.short_description,
        categories: formData.categories.map(id => ({ id })),
        images: formData.images.map(img => ({ id: img.id })),
        attributes: formData.attributes.map(attr => ({
          id: attr.id || 0,
          name: attr.name,
          options: attr.options || [],
          variation: attr.variation || false,
          visible: attr.visible !== false,
        })),
        weight: formData.weight || '',
        dimensions: {
          length: formData.length || '',
          width: formData.width || '',
          height: formData.height || '',
        },
        tags: formData.tags.map(tag => ({ id: tag.id, name: tag.name })),
      };

      if (product) {
        await productsAPI.update(product.id, productData);
        // Show success message box
        alert(t('productUpdated'));
        onSave();
      } else {
        await productsAPI.create(productData);
        onSave();
      }
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (stepIndex) => {
    const errors = {};
    switch (stepIndex) {
      case 0: // General
        if (!formData.name || formData.name.trim() === '') {
          errors.name = 'שם המוצר נדרש';
        }
        if (!formData.regular_price || formData.regular_price === '') {
          errors.regular_price = 'מחיר רגיל נדרש';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
      default:
        setValidationErrors({});
        return true;
    }
  };

  // Memoize validation state to prevent infinite re-renders
  const isCurrentStepValid = useMemo(() => {
    const errors = {};
    switch (currentStep) {
      case 0: // General
        if (!formData.name || formData.name.trim() === '') {
          errors.name = true;
        }
        if (!formData.regular_price || formData.regular_price === '') {
          errors.regular_price = true;
        }
        return Object.keys(errors).length === 0;
      default:
        return true;
    }
  }, [currentStep, formData.name, formData.regular_price]);

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    // Only allow going to current step or previous steps (no skipping ahead)
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white sm:rounded-lg max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ProductModalHeader 
          steps={steps}
          currentStep={currentStep}
          onClose={onClose}
          goToStep={goToStep}
        />

        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => {
            // Prevent form submission on Enter key unless on last step
            if (e.key === 'Enter' && currentStep < steps.length - 1) {
              e.preventDefault();
            }
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {currentStep === 0 && (
              <ProductModalGeneralStep
                formData={formData}
                setFormData={setFormData}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
                allCategories={allCategories}
              />
            )}

            {/* Old General Step - Remove after testing */}
            {false && currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('productType')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="simple">{t('simple')}</option>
                    <option value="variable">{t('variable')}</option>
                    <option value="grouped">{t('grouped')}</option>
                    <option value="external">{t('external')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('productName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (validationErrors.name) {
                        setValidationErrors({ ...validationErrors, name: null });
                      }
                    }}
                    className={`input-field ${validationErrors.name ? 'border-orange-500' : ''}`}
                  />
                  {validationErrors.name && (
                    <p className={`text-orange-500 text-xs mt-1 ${'text-right'}`}>
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('shortDescription')}
                  </label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                      {t('regularPrice')} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.regular_price}
                      onChange={(e) => {
                        setFormData({ ...formData, regular_price: e.target.value });
                        if (validationErrors.regular_price) {
                          setValidationErrors({ ...validationErrors, regular_price: null });
                        }
                      }}
                      className={`input-field ${validationErrors.regular_price ? 'border-orange-500' : ''}`}
                    />
                    {validationErrors.regular_price && (
                      <p className={`text-orange-500 text-xs mt-1 ${'text-right'}`}>
                        {validationErrors.regular_price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                      {t('salePrice')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                      {t('sku')}
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                      {t('stockStatus')}
                    </label>
                    <select
                      value={formData.stock_status}
                      onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                      className="input-field"
                    >
                      <option value="instock">{t('inStock')}</option>
                      <option value="outofstock">{t('outOfStock')}</option>
                      <option value="onbackorder">{t('onBackorder')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('stockQuantity')}
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('categories')}
                  </label>
                  <select
                    multiple
                    value={formData.categories.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setFormData({ ...formData, categories: selected });
                    }}
                    className="input-field h-32"
                  >
                    {allCategories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    החזק Ctrl (Cmd ב-Mac) כדי לבחור מספר קטגוריות
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('tags')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('addTagIcon as Tags')}
                    value={formData.tags.map(t => t.name).join(', ')}
                    onChange={(e) => {
                      const tagNames = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setFormData({
                        ...formData,
                        tags: tagNames.map(name => ({ id: 0, name })),
                      });
                    }}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Images Step */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold text-gray-800 ${'text-right'}`}>
                    {t('images')}
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                      {t('addImage')}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      uploadError 
                        ? 'border-orange-300 bg-orange-50' 
                        : uploadingImage 
                        ? 'border-primary-300 bg-primary-50' 
                        : 'border-gray-300'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="image-upload" className={`cursor-pointer ${uploadingImage ? 'pointer-events-none' : ''}`}>
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
                            <span className="text-sm text-gray-600">{t('uploading') || t('loading')}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">{t('addImage')}</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                          </div>
                        )}
                      </label>
                      {uploadError && (
                        <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                          <p className="text-sm text-orange-800 text-left">{uploadError}</p>
                          {uploadError.includes('Application Password') && (
                            <p className="text-xs text-orange-600 mt-2 text-left">
                              {t('goToSettings') || 'Go to Settings → WordPress Application Password to configure.'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={image.id} className="relative group">
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded z-10">
                              {t('setFeaturedImage')}
                            </span>
                          )}
                          <img
                            src={image.src || image.url}
                            alt="Product"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFeaturedImage(image.id)}
                              className="opacity-0 group-hover:opacity-100 bg-primary-500 text-white p-2 rounded"
                              title={t('setFeaturedImage')}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="opacity-0 group-hover:opacity-100 text-white bg-orange-600 p-2 rounded"
                              title={t('removeImage')}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attributes & Variations Step */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Attributes Section */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold text-gray-800 ${'text-right'}`}>
                    {t('attributes')}
                  </h3>
                  <div className={`flex items-center ${'flex-row-reverse'} justify-between`}>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Plus className="w-[18px] h-[18px]" />
                      <span>{t('addAttribute')}</span>
                    </button>
                  </div>

                  {formData.attributes.map((attr, index) => (
                    <div key={index} className="card">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                              {t('attributeName')} *
                            </label>
                            <select
                              value={attr.id || ''}
                              onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedAttr = allAttributes.find(a => a.id === selectedId);
                                if (selectedAttr) {
                                  updateAttribute(index, 'id', selectedId);
                                  updateAttribute(index, 'name', selectedAttr.name);
                                  loadAttributeTerms(selectedId, index);
                                } else {
                                  updateAttribute(index, 'id', 0);
                                  updateAttribute(index, 'name', '');
                                }
                              }}
                              className="input-field mb-2"
                            >
                              <option value="">-- בחר תכונה קיימת או הזן חדשה --</option>
                              {allAttributes.map((att) => (
                                <option key={att.id} value={att.id}>
                                  {att.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={attr.name}
                              onChange={(e) => {
                                updateAttribute(index, 'name', e.target.value);
                                updateAttribute(index, 'id', 0);
                              }}
                              className="input-field"
                              placeholder="e.g., Color, Size"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={attr.variation || false}
                                onChange={(e) => updateAttribute(index, 'variation', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{t('usedForVariations')}</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={attr.visible !== false}
                                onChange={(e) => updateAttribute(index, 'visible', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{t('visibleOnProductPage')}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeAttribute(index)}
                              className="text-orange-600 hover:text-orange-700 p-2"
                            >
                              <Trash className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                            {t('attributeValues')}
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {attr.options?.map((option, optIndex) => (
                              <span
                                key={optIndex}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                              >
                                {option}
                                <button
                                  type="button"
                                  onClick={() => removeAttributeOption(index, optIndex)}
                                  className="ml-2 text-orange-600 hover:text-orange-700"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={t('addValue')}
                              className="input-field flex-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = e.target.value.trim();
                                  if (value) {
                                    addAttributeOption(index, value);
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Variations Section */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className={`text-lg font-semibold text-gray-800 ${'text-right'}`}>
                    {t('variations')}
                  </h3>
                  {formData.type === 'variable' ? (
                    <div>
                      <p className="text-gray-600 mb-4">
                        {isRTL 
                          ? 'וריאציות יווצרו אוטומטית על בסיס התכונות שהוגדרו. שמור את המוצר כדי ליצור וריאציות.'
                          : 'Variations will be created automatically based on defined attributes. Save the product to generate variations.'}
                      </p>
                      {formData.attributes.filter(attr => attr.variation).length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            {isRTL 
                              ? 'אנא הגדר תכונות עם אפשרות "שימוש בוריאציות" בשלב התכונות כדי ליצור וריאציות.'
                              : 'Please define attributes with "Used for Variations" enabled in the Attributes step to create variations.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <p className="text-primary-800">
                        {isRTL 
                          ? 'וריאציות זמינות רק עבור מוצרים משתנים. שנה את סוג המוצר ל"משתנה" בשלב הכללי כדי להשתמש בוריאציות.'
                          : 'Variations are only available for variable products. Change the product type to "Variable" in the General step to use variations.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions - sticky at bottom */}
          <div
            className={`sticky bottom-0 flex ${'flex-row-reverse'} justify-between items-center p-6 border-t border-gray-200 bg-gray-50`}
          >
            <div className={`flex ${'flex-row-reverse'} items-center space-x-2 text-sm text-gray-600`}>
              <span>
                {t('step')} {currentStep + 1} {t('of')} {steps.length}
              </span>
            </div>
            <div className={`flex ${'flex-row-reverse'} space-x-3`}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={saving}
              >
                {t('cancel')}
              </button>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className={`btn-secondary flex items-center ${'flex-row-reverse'} space-x-2`}
                  disabled={saving}
                >
                  {isRTL ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
                  <span>{t('previous')}</span>
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`btn-primary flex items-center ${'flex-row-reverse'} space-x-2`}
                  disabled={saving || !isCurrentStepValid}
                >
                  <span>{t('next')}</span>
                  {isRTL ? <ChevronLeft className="w-[18px] h-[18px]" /> : <ChevronRight className="w-[18px] h-[18px]" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }}
                  className="btn-primary"
                  disabled={saving || !isCurrentStepValid}
                >
                  {saving ? t('saving') : product ? t('update') : t('createProduct')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

