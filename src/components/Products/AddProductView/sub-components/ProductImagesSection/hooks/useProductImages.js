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
      const formattedNewImages = allNewImages.map(img => {
        // Handle potential nested response structure (e.g. { data: { ... } } or { image: { ... } })
        const data = img.data || img.image || img;

        // Debug log for image structure
        if (!data.id || (!data.source_url && !data.url && !data.src)) {
          secureLog.warn('Potential invalid image structure:', img);
        }

        return {
          id: data.id,
          src: data.source_url || data.url || data.src,
          name: data.title?.rendered || data.filename || data.name || 'Image'
        };
      }).filter(img => img.id); // Filter out failed/invalid images

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





