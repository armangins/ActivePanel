import { memo, useState, useEffect } from 'react';
import { Upload, Modal, Progress, Flex, Typography, theme } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { mediaAPI } from '../../../../../services/woocommerce';
import { useMessage } from '../../../../../contexts/MessageContext';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

/**
 * ImageUpload Component
 * 
 * Reusable single image upload component using Ant Design Pictures Wall style.
 * 
 * @param {Object} value - Current image object { id, src, url, etc. } or null
 * @param {function} onChange - Callback when image changes (receives image object or null)
 * @param {string} label - Label text (optional)
 * @param {boolean} required - Whether upload is required
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether upload is disabled
 */
const ImageUpload = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
  disabled = false,
}) => {
  const { t } = useLanguage();
  const messageApi = useMessage();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (value) {
      setFileList([{
        uid: value.id || '-1',
        name: value.name || 'Image',
        status: 'done',
        url: value.src || value.url || value.source_url,
      }]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // If list is empty, it means the image was removed
    if (newFileList.length === 0) {
      onChange(null);
    }
  };

  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        onProgress({ percent: 50 });
      }, 100);

      const uploadedImage = await mediaAPI.upload(formData);

      clearInterval(interval);
      onProgress({ percent: 100 });

      setLoading(false);
      onSuccess(uploadedImage);
      onChange?.(uploadedImage);
      messageApi.success(t('imageUploaded') || 'הועלה בהצלחה');
    } catch (error) {
      setLoading(false);
      onError(error);
      const errorMessage = error?.message || t('imageUploadFailed') || 'העלאה נכשלה';
      messageApi.error(errorMessage);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{t('upload') || 'כאן בוחרים קבצים'}</div>
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
              תמונה מעלה...
            </Typography.Text>
            <Progress percent={file.percent} size="small" showInfo={false} strokeColor={token.colorPrimary} />
          </Flex>
        </div>
      );
    }
    return originNode;
  };

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 text-right font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      <div className="flex justify-end dir-rtl">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          customRequest={customRequest}
          disabled={disabled || loading}
          maxCount={1}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: !disabled,
          }}
          itemRender={itemRender}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </div>

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default memo(ImageUpload);
