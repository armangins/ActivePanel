import { memo, useState } from 'react';
import { XMarkIcon as X, ArrowUpTrayIcon as Upload, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { mediaAPI } from '../../../../services/woocommerce';

/**
 * ImageUpload Component
 * 
 * A smart and reusable single image upload component with:
 * - Image preview
 * - Upload progress indicator
 * - Remove image functionality
 * - Error handling
 * - RTL support
 * - Customizable sizing and styling
 * 
 * @param {Object} value - Current image object { id, src, url, etc. } or null
 * @param {function} onChange - Callback when image changes (receives image object or null)
 * @param {string} label - Label text (optional)
 * @param {boolean} required - Whether upload is required
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional CSS classes
 * @param {string} inputId - Unique ID for the file input (optional, auto-generated)
 * @param {boolean} disabled - Whether upload is disabled
 * @param {function} onError - Custom error handler (optional)
 */
const ImageUpload = ({
  value,
  onChange,
  label,
  required = false,
  size = 'md',
  className = '',
  inputId,
  disabled = false,
  onError,
}) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [localInputId] = useState(() => inputId || `image-upload-${Math.random().toString(36).substr(2, 9)}`);

  // Size variants
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow uploading the same file again
    e.target.value = '';

    setUploading(true);
    try {
      const uploadedImage = await mediaAPI.upload(file);
      onChange?.(uploadedImage);
    } catch (error) {
      const errorMessage = error?.message || t('imageUploadFailed') || 'העלאת תמונה נכשלה';
      if (onError) {
        onError(error, errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  const imageSrc = value?.src || value?.url || value?.source_url;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {label}
          {required && <span className="text-orange-500 ml-1">*</span>}
        </label>
      )}

      {imageSrc ? (
        <div className={`relative ${sizeClasses[size] || sizeClasses.md} border-2 border-gray-200 rounded-lg overflow-hidden`}>
          <img
            src={imageSrc}
            alt={label || 'Image'}
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors"
              aria-label={t('removeImage') || 'הסר תמונה'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={localInputId}
            disabled={disabled || uploading}
          />
          <label
            htmlFor={localInputId}
            className={`cursor-pointer w-full h-full flex flex-col items-center justify-center ${
              disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-6 h-6 animate-spin text-primary-500 mb-2" />
                <span className="text-sm text-gray-600">{t('uploading') || 'מעלה...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">{t('uploadImage') || 'העלה תמונה'}</span>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default memo(ImageUpload);



