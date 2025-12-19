import { useState } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { mediaAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';

interface ImageUploadProps {
    value?: any[];
    onChange?: (fileList: any[]) => void;
    maxCount?: number;
}

export const ImageUpload = ({ value = [], onChange, maxCount = 5 }: ImageUploadProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<any[]>(
        value.map((img: any) => ({
            uid: img.id?.toString() || Math.random().toString(),
            name: img.name || 'image.png',
            status: 'done',
            url: img.src
        }))
    );

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);

        // Convert Ant Design fileList to our format
        const images = newFileList
            .filter((file: any) => file.status === 'done' && file.url)
            .map((file: any) => ({
                id: file.uid && !isNaN(parseInt(file.uid)) ? parseInt(file.uid) : undefined,
                src: file.url,
                name: file.name
            }));

        if (onChange) {
            onChange(images);
        }
    };

    const customRequest = async ({ file, onSuccess, onError }: any) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await mediaAPI.upload(formData);

            // Fix: response structure from WP API might vary
            const uploadedUrl = response.source_url || response.guid?.rendered;

            if (!uploadedUrl) {
                throw new Error('Upload failed - No URL returned');
            }

            onSuccess({
                url: uploadedUrl,
                uid: response.id
            });

            // Manually update the file list with the real URL
            setFileList(prev => prev.map(f => {
                if (f.uid === file.uid) {
                    return { ...f, status: 'done', url: uploadedUrl, uid: response.id };
                }
                return f;
            }));

            // Trigger onChange
            const newImages = [...value, { id: response.id, src: uploadedUrl, name: file.name }];
            if (onChange) onChange(newImages);

        } catch (error) {
            secureLog.error('Image upload failed', error);
            message.error('Failed to upload image');
            onError(error);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                customRequest={customRequest}
                maxCount={maxCount}
            >
                {fileList.length >= maxCount ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
