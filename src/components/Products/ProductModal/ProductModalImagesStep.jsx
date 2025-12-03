import { ImageIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UploadIcon } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ProductModalImagesStep Component
 * 
 * Second step of the product modal - product images
 */
const ProductModalImagesStep = ({
  formData,
  setFormData,
  uploadingImage,
  uploadError,
  handleImageUpload,
  setFeaturedImage,
  removeImage
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold text-gray-800 text-right`}>
          {t('images')}
        </h3>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
            {t('addImage')}
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-right ${uploadError
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
                <p className="text-sm text-orange-800 text-right">{uploadError}</p>
                {uploadError.includes('Application Password') && (
                  <p className="text-xs text-orange-600 mt-2 text-right">
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
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModalImagesStep;

