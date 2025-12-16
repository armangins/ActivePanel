import { memo, useState, useEffect } from 'react';
import { Upload, Modal, Progress, Flex, Typography, theme, Alert, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { mediaAPI } from '../../../../../services/woocommerce';
import { useMessage } from '../../../../../contexts/MessageContext';

const { Title } = Typography;

/**
 * ProductImagesSection Component
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
  const { token } = theme.useToken();

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

  const beforeUpload = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.warning(t('largeFileWarning') || 'הקובץ גדול מ-2MB, העלאה עלולה להיות איטית. מומלץ להשתמש ב-WebP.');
    }
    return true; // Allow upload but warn
  };

  const handleChange = ({ fileList: newFileList }) => {
    console.log('ProductImagesSection: handleChange', newFileList);
    setFileList(newFileList);
  };

  const handleRemove = (file) => {
    console.log('ProductImagesSection: handleRemove', file);
    if (file.id) {
      onRemove(file.id);
    }
    return true;
  };

  // Custom request to handle direct uploads
  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    console.log('ProductImagesSection: customRequest started', file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('ProductImagesSection: calling mediaAPI.upload');
      const uploadedImage = await mediaAPI.upload(formData);
      console.log('ProductImagesSection: mediaAPI.upload success', uploadedImage);

      onSuccess(uploadedImage);
      onUpload([uploadedImage]);
      messageApi.success(t('imageUploaded') || 'הועלה בהצלחה');
    } catch (error) {
      console.error('ProductImagesSection: upload failed', error);
      onError(error);
      const errorMessage = error?.message || t('imageUploadFailed') || 'העלאה נכשלה';
      messageApi.error(errorMessage);
    }
  };

  const defaultUploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t('upload') || 'העלאה'}</div>
    </button>
  );

  const itemRender = (originNode, file, fileList, actions) => {
    if (file.status === 'uploading') {
      return (
        <div style={{ height: '100%', padding: '8px', border: `1px dashed ${token.colorBorder}`, borderRadius: token.borderRadiusLG }}>
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
    <Card styles={{ body: { padding: 24 } }}>
      <Title level={4} style={{ marginBottom: 24, textAlign: 'right' }}>
        תמונות מוצר
      </Title>

      <div style={{ direction: 'rtl' }}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          onRemove={handleRemove}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          multiple={true}
          maxCount={maxImages}
          itemRender={itemRender}
        >
          {fileList.length >= maxImages ? null : defaultUploadButton}
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





