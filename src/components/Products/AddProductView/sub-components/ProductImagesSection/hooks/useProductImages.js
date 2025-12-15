import { useState, useCallback } from 'react';
import { mediaAPI } from '../../../../../../services/woocommerce';
import { secureLog } from '../../../../../../utils/logger';

/**
 * Custom hook for managing product images
 * @returns {Object} - Image state and handlers
 */
export const useProductImages = () => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = useCallback(async (fileList, currentImages = [], onUpdate) => {
    // Check if input is array-like, if not wrap in array
    const items = Array.isArray(fileList) ? fileList : Array.from(fileList || []);
    if (items.length === 0) return;

    setUploadingImage(true);
    try {
      // Separate raw Files (need upload) from already uploaded objects (need formatting)
      const filesToUpload = items.filter(item => item instanceof File);
      const preUploadedImages = items.filter(item => !(item instanceof File));

      let newlyUploadedImages = [];

      // Upload raw files if any
      if (filesToUpload.length > 0) {
        const uploadPromises = filesToUpload.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          return mediaAPI.upload(formData);
        });
        newlyUploadedImages = await Promise.all(uploadPromises);
      }

      // Combine all images
      const allNewImages = [...newlyUploadedImages, ...preUploadedImages];

      // Format to common structure
      const formattedNewImages = allNewImages.map(img => ({
        id: img.id,
        src: img.source_url || img.url || img.src,
        name: img.title?.rendered || img.filename || img.name || 'Image'
      }));

      const updatedImages = [...currentImages, ...formattedNewImages];
      onUpdate?.(updatedImages);

      return { success: true, images: formattedNewImages };
    } catch (error) {
      secureLog.error('Image upload failed', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const removeImage = useCallback((imageId, currentImages = [], onUpdate) => {
    const updatedImages = currentImages.filter(img => img.id !== imageId);
    onUpdate?.(updatedImages);
  }, []);

  return {
    uploadingImage,
    handleImageUpload,
    removeImage
  };
};





