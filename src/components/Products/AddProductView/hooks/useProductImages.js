import { useState, useCallback } from 'react';
import { mediaAPI } from '../../../../services/woocommerce';

/**
 * Custom hook for managing product images
 * @returns {Object} - Image state and handlers
 */
export const useProductImages = () => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = useCallback(async (fileList, currentImages = [], onUpdate) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(file => mediaAPI.upload(file));
      const uploadedImages = await Promise.all(uploadPromises);

      const newImages = uploadedImages.map(img => ({
        id: img.id,
        src: img.source_url || img.url,
        name: img.title?.rendered || img.filename || 'Image'
      }));

      const updatedImages = [...currentImages, ...newImages];
      onUpdate?.(updatedImages);

      return { success: true, images: newImages };
    } catch (error) {
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





