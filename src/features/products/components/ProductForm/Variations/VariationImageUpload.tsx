import React from 'react';
import { Upload, Button, theme } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface VariationImageUploadProps {
    value: any;
    onChange: (value: any) => void;
}

export const VariationImageUpload: React.FC<VariationImageUploadProps> = ({ value, onChange }) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    return (
        <div style={{ width: '100%' }}>
            <Upload
                listType="picture-card"
                maxCount={1}
                showUploadList={false}
                beforeUpload={() => false}
                fileList={
                    value instanceof File
                        ? [{
                            uid: '-1',
                            name: value.name,
                            status: 'done' as const,
                            url: URL.createObjectURL(value)
                        }]
                        : value?.src
                            ? [{
                                uid: '-1',
                                name: value.name || 'image',
                                status: 'done' as const,
                                url: value.src
                            }]
                            : []
                }
                onChange={async (info) => {
                    if (info.fileList.length > 0) {
                        const file = info.fileList[info.fileList.length - 1];
                        if (file.originFileObj) {
                            onChange(file.originFileObj);
                        }
                    }
                }}
                className="full-width-upload"
            >
                {value ? (
                    <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', borderRadius: token.borderRadius }}>
                        <img
                            src={
                                value instanceof File
                                    ? URL.createObjectURL(value)
                                    : value?.src
                            }
                            alt="Variation"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                background: token.colorFillQuaternary
                            }}
                        />
                        <div
                            className="upload-overlay"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: '#fff', fontSize: 16 }} />}
                                title={t('replaceImage') || "Replace"}
                            />
                            <Button
                                type="text"
                                icon={<DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />}
                                title={t('removeImage') || "Remove"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(undefined);
                                }}
                            />
                        </div>
                        <style>{`
                            .full-width-upload:hover .upload-overlay {
                                opacity: 1 !important;
                            }
                        `}</style>
                    </div>
                ) : (
                    <div style={{
                        width: '100%',
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <UploadOutlined style={{ fontSize: 32, color: token.colorTextQuaternary }} />
                        <div style={{ marginTop: 8, color: token.colorTextQuaternary }}>{t('upload')}</div>
                    </div>
                )}
            </Upload>
            <style>{`
                .full-width-upload .ant-upload-select {
                    width: 100% !important;
                    height: 180px !important;
                    overflow: hidden;
                    padding: 0 !important;
                }
            `}</style>
        </div>
    );
};
