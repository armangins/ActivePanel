import { memo, useState, useEffect } from 'react';
import { Upload, Modal, message, Progress, Flex, Typography, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Card } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { mediaAPI } from '../../../../../services/woocommerce';
import { useCenteredMessage } from '../../../../../hooks/useCenteredMessage';

/**
 * ProductImagesSection Component
 * 
 * Manages product images using Ant Design's Pictures Wall pattern.
 * Supports multiple image uploads, preview, and removal.
 * 
 * @param {Array} images - Array of image objects { id, src, name }
 * @param {function} onUpload - Callback when files are uploaded (receives FileList)
 * @param {function} onRemove - Callback to remove an image (receives imageId)
 * @param {number} maxImages - Maximum number of images allowed (default: 12)
 */
const ProductImagesSection = ({
  images = [],
  onUpload,
  onRemove,
  maxImages = 12,
}) => {
  const { t } = useLanguage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Use message hook for context-aware messages with automatic centering
  const [messageApi, contextHolder] = useCenteredMessage();
  const [fileList, setFileList] = useState([]);

  // Sync fileList with images prop
  useEffect(() => {
    // Only update if the images prop has changed effectively (ignoring local temporary uploads)
    // We filter out any currently uploading files from the incoming prop sync to avoid overwriting them
    // But since the prop update usually comes AFTER upload success, we can merge.

    const formattedImages = images.map((img) => ({
      uid: img.id.toString(),
      name: img.name || `Image ${img.id}`,
      status: 'done',
      url: img.src,
    }));

    setFileList(prev => {
      // Keep locally uploading files that aren't in the new prop list yet
      const uploadingFiles = prev.filter(f => f.status === 'uploading');
      // Combine prop images with currently uploading ones
      // Note: This matches the requirement to show progress. 
      // Once upload completes, the parent updates 'images', and it will replace the 'uploading' entry here.
      return [...formattedImages, ...uploadingFiles];
    });
  }, [images]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    if (file.status === 'removed') {
      onRemove?.(Number(file.uid));
    }
  };

  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      // Show artificial progress since axios might be too fast or opaque for small files
      // or to give immediate feedback before the request starts
      onProgress({ percent: 0 });

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for better UX on fast connections or while waiting for server
      const interval = setInterval(() => {
        onProgress({ percent: 50 });
      }, 100);

      const uploadedImage = await mediaAPI.upload(formData);

      clearInterval(interval);
      onProgress({ percent: 100 });

      onUpload?.([uploadedImage]);
      onSuccess(uploadedImage);
      messageApi.success(t('imageUploaded') || 'הועלה בהצלחה');
    } catch (error) {
      onError(error);
      const errorMessage = error?.message || t('imageUploadFailed') || 'העלאה נכשלה';
      messageApi.error(errorMessage);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t('upload') || 'העלאה'}</div>
    </button>
  );

  // Use theme tokens for consistent styling
  const { token } = theme.useToken();

  const itemRender = (originNode, file, fileList, actions) => {
    if (file.status === 'uploading') {
      return (
        <div className="ant-upload-list-item ant-upload-list-item-uploading" style={{ height: '100%', padding: '8px', border: `1px dashed ${token.colorBorder}`, borderRadius: token.borderRadiusLG }}>
          <Flex vertical align="center" justify="center" style={{ height: '100%', width: '100%' }}>
            <Typography.Text style={{ marginBottom: 8, fontSize: 14, color: token.colorPrimary }}>
              מעלה...
            </Typography.Text>
            <Progress percent={file.percent} size="small" showInfo={false} strokeColor={token.colorPrimary} />
          </Flex>
        </div>
      );
    }
    return originNode;
  };

  return (
    <Card className="p-6">
      {contextHolder}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">
        {t('uploadImages')}
      </h3>

      <div className="dir-rtl">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          customRequest={customRequest}
          multiple={true}
          maxCount={maxImages}
          itemRender={itemRender}
        >
          {fileList.length >= maxImages ? null : uploadButton}
        </Upload>
      </div>

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>

      <p className="text-xs text-gray-500 mt-4 text-right">
        <span className="font-semibold">{t('highlyRecommended')}:</span> {t('useWebPFormat')}.
      </p>
    </Card>
  );
};

export default memo(ProductImagesSection);





