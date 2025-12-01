import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ProductModalGeneralStep Component
 * 
 * First step of the product modal - general product information
 */
const ProductModalGeneralStep = ({ formData, setFormData, validationErrors, setValidationErrors, allCategories }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
        <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
          <p className={`text-orange-500 text-xs mt-1 text-right`}>
            {validationErrors.name}
          </p>
        )}
      </div>

      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
        <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
            <p className={`text-orange-500 text-xs mt-1 text-right`}>
              {validationErrors.regular_price}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
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
        <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
          {t('stockQuantity')}
        </label>
        <input
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
            {t('weight')} (kg)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
            {t('length')} (cm)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
            {t('width')} (cm)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.width}
            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
            {t('height')} (cm)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductModalGeneralStep;

