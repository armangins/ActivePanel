import { memo } from 'react';
import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { Card } from '../../../ui';
import { UploadIcon } from '../../../ui';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * ProductImagesSection Component
 * 
 * A clean component for managing product images with:
 * - Image grid display (3 columns)
 * - Multiple image upload
 * - Remove image functionality
 * - Main image indicator
 * - Upload progress indicator
 * 
 * @param {Array} images - Array of image objects { id, src, name }
 * @param {boolean} uploading - Whether images are being uploaded
 * @param {string} error - Error message (if any)
 * @param {function} onUpload - Callback when files are selected (receives FileList)
 * @param {function} onRemove - Callback to remove an image (receives imageId)
 * @param {number} maxImages - Maximum number of images allowed (default: 12)
 */
const ProductImagesSection = ({
  images = [],
  uploading = false,
  error,
  onUpload,
  onRemove,
  maxImages = 12,
}) => {
  const { t } = useLanguage();

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload?.(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">
        {t('uploadImages')}
      </h3>
      
      {/* Images Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div key={image.id} className="relative group aspect-square">
            <img
              src={image.src}
              alt={image.name || 'Product'}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Main Image Badge - Show only if more than 1 image and it's the first one */}
            {images.length > 1 && index === 0 && (
              <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                {t('mainImage') || 'תמונה ראשית'}
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove?.(image.id)}
              className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={t('removeImage') || 'הסר תמונה'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload Area - Only show if less than max images */}
        {images.length < maxImages && (
          <div className={`border-2 border-dashed rounded-lg aspect-square flex items-center justify-center ${
            error ? 'border-orange-300 bg-orange-50' : 'border-blue-300 bg-blue-50'
          }`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              onClick={(e) => {
                // Reset value on click to allow selecting the same file again
                e.target.value = '';
              }}
              className="hidden"
              id="product-image-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="product-image-upload" 
              className={`cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
                  <span className="text-sm text-gray-600">{t('uploading') || 'מעלה...'}</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-xs text-gray-600 text-center px-2">
                    {t('dropImagesHere') || 'Drop your images here or select click to browse'}
                  </span>
                </>
              )}
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-orange-500 text-xs mt-2 text-right">{error}</p>
      )}
      <p className="text-xs text-gray-500 mt-4 text-right">
        <span className="font-semibold">{t('highlyRecommended') || 'מומלץ מאוד'}:</span> {t('useWebPFormat') || 'להשתמש בפורמט WEBP'}. {t('min1ImageNote') || 'עליך להוסיף לפחות תמונה אחת. שים לב לאיכות התמונות שאתה מוסיף, עומד בתקני צבע הרקע. תמונות חייבות להיות במידות מסוימות. שים לב שהמוצר מציג את כל הפרטים.'}
      </p>
    </Card>
  );
};

export default memo(ProductImagesSection);





