import { useState, useEffect, useRef } from 'react';
import type { UploadFile, UploadProps } from 'antd';
// import { mediaAPI } from '@/services/woocommerce'; // Removed
import { uploadImageToFirebase } from '@/services/firebase';
import { useMessage } from '@/contexts/MessageContext';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { convertImageToWebP } from '@/utils/imageConversion';
import type { ImageData } from './types';
// import { mediaUploadResponseSchema } from './types'; // Removed

export const useImageUpload = (
    value: ImageData[] = [],
    onChange?: (fileList: ImageData[]) => void
) => {
    const message = useMessage();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Store blob URLs by file uid to persist across renders
    const blobUrlMapRef = useRef<Map<string, string>>(new Map());

    // Helper function to truncate long filenames
    const truncateFilename = (filename: string, maxLength: number = 20): string => {
        if (filename.length <= maxLength) return filename;
        const extension = filename.split('.').pop() || '';
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
        return `${truncatedName}...${extension}`;
    };

    // Only sync fileList with value prop on INITIAL mount, not on every change
    // This prevents overwriting blob URLs during upload
    useEffect(() => {
        // Only sync if fileList is empty (initial mount)
        if (fileList.length === 0 && value.length > 0) {
            const newFileList: UploadFile[] = value.map((img) => ({
                uid: img.id?.toString() || Math.random().toString(),
                name: truncateFilename(img.name || 'image.png'),
                status: 'done' as const,
                url: img.src,
            }));
            setFileList(newFileList);
        }
    }, [value]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        // Use existing preview/url first for instant display
        let previewUrl = file.url || file.preview;

        if (!previewUrl && file.originFileObj) {
            previewUrl = await getBase64(file.originFileObj as File);
        }

        setPreviewImage(previewUrl as string);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const updateFormValue = (newFileList: UploadFile[]) => {
        const images: ImageData[] = newFileList
            .filter((file) => file.status === 'done' && file.url)
            .map((file) => ({
                id: file.uid && !isNaN(parseInt(file.uid)) ? parseInt(file.uid) : undefined,
                src: file.url!,
                name: file.name,
            }));

        onChange?.(images);
    };

    // Create instant preview BEFORE upload starts
    const beforeUpload = (file: File) => {
        // Just return the file, handleChange will add it with instant preview
        return file;
    };

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options;

        try {
            // Convert to WebP
            let fileToUpload: File;
            try {
                fileToUpload = await convertImageToWebP(file as File);
            } catch (conversionError) {
                console.error('WebP conversion failed, falling back to original', conversionError);
                fileToUpload = file as File; // Fallback to original
            }

            // Upload to Firebase Storage
            const uploadedUrl = await uploadImageToFirebase(fileToUpload);

            onSuccess({
                url: uploadedUrl,
                uid: file.uid,
            });

            // Update file list with the real URL
            setFileList((prev) => {
                const updated = prev.map((f) => {
                    if (f.uid === (file as unknown as UploadFile).uid) {
                        // Revoke the blob URL to free memory
                        if (f.preview && f.preview.startsWith('blob:')) {
                            URL.revokeObjectURL(f.preview);
                        }
                        return {
                            ...f,
                            status: 'done' as const,
                            url: uploadedUrl,
                            uid: file.uid, // Keep original UID (non-numeric for new files)
                            name: truncateFilename(file.name),
                            preview: undefined,
                        };
                    }
                    return f;
                });
                // Defer form value update
                setTimeout(() => {
                    updateFormValue(updated);
                }, 0);
                return updated;
            });
        } catch (error: any) {
            secureLog.error('Image upload failed', error);
            const errorMessage = error?.message || 'Failed to upload image';
            message.error(errorMessage);

            onError?.(error);

            setFileList((prev) => {
                return prev.map((f) => {
                    if (f.uid === (file as unknown as UploadFile).uid) {
                        return {
                            ...f,
                            status: 'error' as const,
                            response: errorMessage,
                        };
                    }
                    return f;
                });
            });
        }
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Create blob URLs for immediate preview
        const updatedFileList = newFileList.map((file) => {
            // Check if we already have a blob URL for this file uid in our ref
            const existingBlobUrl = blobUrlMapRef.current.get(file.uid);
            if (existingBlobUrl) {
                // Keep preview but DO NOT set status to done optimistically
                file.preview = existingBlobUrl;
                // file.status = 'done'; // Removed to disable optimistic UI
                return file;
            }

            // Only create blob URL if file doesn't already have a URL
            if (file.originFileObj && !file.url) {
                // Create a blob URL for instant preview
                const blobUrl = URL.createObjectURL(file.originFileObj);

                // Store in ref for persistence
                blobUrlMapRef.current.set(file.uid, blobUrl);

                file.preview = blobUrl;  // For modal preview
                // file.url = blobUrl;   // Removed: Do not treat blob as final URL
                // file.status = 'done'; // Removed: Do not mark as done until upload finishes
            }
            return file;
        });
        setFileList(updatedFileList);
    };

    const handleRemove = (file: UploadFile) => {
        const newFileList = fileList.filter((f) => f.uid !== file.uid);
        setFileList(newFileList);
        // Defer form value update to avoid setState during render
        setTimeout(() => {
            updateFormValue(newFileList);
        }, 0);
    };

    return {
        fileList,
        previewOpen,
        previewImage,
        previewTitle,
        handleCancel,
        handlePreview,
        handleChange,
        handleRemove,
        customRequest,
        beforeUpload,
        setFileList,
    };
};

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
