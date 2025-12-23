import { useState, useEffect } from 'react';
import { Upload, Modal, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { mediaAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
    value?: any[];
    onChange?: (fileList: any[]) => void;
    maxCount?: number;
}

// Draggable wrapper for each upload item
interface DraggableUploadListItemProps {
    originNode: React.ReactElement;
    file: UploadFile;
}

const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: file.uid,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {originNode}
        </div>
    );
};

export const ImageUpload = ({ value = [], onChange, maxCount = 5 }: ImageUploadProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Helper function to truncate long filenames
    const truncateFilename = (filename: string, maxLength: number = 20): string => {
        if (filename.length <= maxLength) return filename;
        const extension = filename.split('.').pop() || '';
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
        return `${truncatedName}...${extension}`;
    };

    // Configure drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10, // Require 10px movement before drag starts
            },
        })
    );

    // Handle drag end event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFileList((prevFileList) => {
                const oldIndex = prevFileList.findIndex((item) => item.uid === active.id);
                const newIndex = prevFileList.findIndex((item) => item.uid === over.id);

                const newFileList = arrayMove(prevFileList, oldIndex, newIndex);

                // Update form values with new order after state update
                setTimeout(() => {
                    updateFormValue(newFileList);
                }, 0);

                return newFileList;
            });
        }
    };

    // Sync fileList with value prop
    useEffect(() => {
        const newFileList: UploadFile[] = value.map((img: any) => ({
            uid: img.id?.toString() || Math.random().toString(),
            name: truncateFilename(img.name || 'image.png'),
            status: 'done' as const,
            url: img.src,
        }));
        setFileList(newFileList);
    }, [value]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const updateFormValue = (newFileList: UploadFile[]) => {
        const images = newFileList
            .filter((file: UploadFile) => file.status === 'done' && file.url)
            .map((file: UploadFile) => ({
                id: file.uid && !isNaN(parseInt(file.uid)) ? parseInt(file.uid) : undefined,
                src: file.url,
                name: file.name,
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

            const uploadedUrl = response.source_url || response.guid?.rendered;

            if (!uploadedUrl) {
                throw new Error('Upload failed - No URL returned');
            }

            onSuccess({
                url: uploadedUrl,
                uid: response.id,
            });

            // Update file list with the real URL and truncated name
            setFileList(prev => {
                const updated = prev.map(f => {
                    if (f.uid === file.uid) {
                        return {
                            ...f,
                            status: 'done' as const,
                            url: uploadedUrl,
                            uid: response.id,
                            name: truncateFilename(file.name)
                        };
                    }
                    return f;
                });
                // Defer form value update to avoid setState during render
                setTimeout(() => {
                    updateFormValue(updated);
                }, 0);
                return updated;
            });
        } catch (error) {
            secureLog.error('Image upload failed', error);
            message.error('Failed to upload image');
            onError(error);
        }
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleRemove = (file: UploadFile) => {
        const newFileList = fileList.filter(f => f.uid !== file.uid);
        setFileList(newFileList);
        // Defer form value update to avoid setState during render
        setTimeout(() => {
            updateFormValue(newFileList);
        }, 0);
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>העלה תמונה</div>
        </button>
    );

    // Custom item render to add "Primary Image" tag and drag functionality
    const itemRender = (originNode: React.ReactElement, file: UploadFile, fileList: UploadFile[]) => {
        const isPrimary = fileList.indexOf(file) === 0;

        const nodeWithTag = (
            <div style={{ position: 'relative' }}>
                {isPrimary && (
                    <Tag
                        color="blue"
                        style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            zIndex: 10,
                            fontSize: '10px',
                            padding: '0 4px',
                            lineHeight: '16px',
                        }}
                    >
                        תמונה ראשית
                    </Tag>
                )}
                {originNode}
            </div>
        );

        return <DraggableUploadListItem originNode={nodeWithTag} file={file} />;
    };

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fileList.map((file) => file.uid)} strategy={verticalListSortingStrategy}>
                    <Upload
                        customRequest={customRequest}
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        multiple
                        accept="image/*"
                        itemRender={itemRender}
                    >
                        {fileList.length >= maxCount ? null : uploadButton}
                    </Upload>
                </SortableContext>
            </DndContext>
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
