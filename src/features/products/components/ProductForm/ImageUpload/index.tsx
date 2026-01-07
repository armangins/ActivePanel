import { Upload, Modal, Tag } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
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
import type { ImageUploadProps, DraggableUploadListItemProps } from './types';
import { useImageUpload } from './useImageUpload';
import { useImageUploadStyles } from './styles';

// Draggable wrapper for each upload item
const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
    const styles = useImageUploadStyles();
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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...styles.draggableItemStyle(isDragging),
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {originNode}
        </div>
    );
};

export const ImageUpload = ({ value = [], onChange, maxCount = 5 }: ImageUploadProps) => {
    const styles = useImageUploadStyles();
    const {
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
    } = useImageUpload(value, onChange);

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
                return arrayMove(prevFileList, oldIndex, newIndex);
            });
        }
    };

    const uploadButton = (
        <button style={styles.uploadButtonStyle} type="button">
            <PlusOutlined />
            <div style={styles.uploadButtonTextStyle}>העלה תמונה</div>
        </button>
    );

    // Custom item render to add "Primary Image" tag and drag functionality
    const itemRender = (originNode: React.ReactElement, file: UploadFile, fileList: UploadFile[]) => {
        const isPrimary = fileList.indexOf(file) === 0;

        const nodeWithTag = (
            <div style={styles.tagContainerStyle}>
                {isPrimary && (
                    <Tag style={styles.primaryTagStyle}>
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
                        beforeUpload={beforeUpload}
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

            {/* Note about WebP conversion */}
            <div style={styles.noteStyle}>
                <ThunderboltOutlined />
                <span>כדי שהאתר יטוס, אנחנו מבצעים אופטימיזציה אוטומטית לכל התמונות וממירים אותן לפורמט WebP – פורמט מתקדם ששומר על איכות מקסימלית לצד טעינה מהירה במיוחד.</span>
            </div>

            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={styles.modalImageStyle} src={previewImage} />
            </Modal>
            <style>{styles.uploadListSizeCSS}</style>
        </>
    );
};
