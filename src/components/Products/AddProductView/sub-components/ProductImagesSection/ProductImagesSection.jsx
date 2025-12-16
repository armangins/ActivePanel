import { memo, useState, useEffect } from 'react';
import { Upload, Modal, message, Progress, Flex, Typography, theme, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Card } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { mediaAPI } from '../../../../../services/woocommerce';
import { useMessage } from '../../../../../contexts/MessageContext';

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
  const messageApi = useMessage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [fileList, setFileList] = useState([]);

  // Utility function for image preview
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    setFileList((images || []).map(img => ({
      uid: img.id || Math.random().toString(),
      name: img.name || 'Image',
      status: 'done',
      url: img.src || img.url,
      // Store original ID for removal
      id: img.id
    })));
  }, [images]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    // Fixed: Correct property access for preview title
    setPreviewTitle(file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : 'Preview'));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // We don't trigger onUpload/onChange here as we handle uploads via customRequest
  };

  const handleRemove = (file) => {
    // If the file has an ID (was successfully uploaded), invoke the onRemove callback
    if (file.id) {
      onRemove(file.id);
    }
    return true; // Allow removal from the UI list
  };

  // Custom request to handle direct uploads
  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create a dummy file in the list temporarily (handled by Ant Design)
      // Call parent onUpload which handles the API call
      // Note: We're adapting the single-file API of customRequest to our multi-file handler
      // Ideally, onUpload should return the uploaded file or promise

      const uploadedImage = await mediaAPI.upload(formData);

      onSuccess(uploadedImage);
      // Trigger update in parent component to add the image to formData
      onUpload([uploadedImage]);
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">
        {t('uploadImages')}
      </h3>

      <div className="dir-rtl">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          onRemove={handleRemove}
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

      <div style={{ marginTop: 16 }}>
        <Alert
          message={
            <div style={{ fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>{t('allowedFiles') || 'קבצים מותרים'}: </span>
              JPG, PNG, WebP
              <br />
              <span style={{ fontWeight: 600, color: token.colorPrimary }}>{t('recommendation') || 'המלצה'}: </span>
              {t('useWebPFormat') || 'מומלץ להשתמש ב-WebP לביצועים טובים יותר'}
            </div>
          }
          type="info"
          showIcon
          style={{ direction: 'rtl', textAlign: 'right' }}
        />
      </div>
    </Card>
  );
};

export default memo(ProductImagesSection);





