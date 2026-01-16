
import React from 'react';
import { Button, Upload, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCombinationSignature } from '@/features/products/utils/variationUtils';

interface VariationImageStepProps {
    combinations?: { id: number | string; name: string; option: string }[][];
    images?: Record<string, any>;
    onImageChange?: (signature: string, image: any) => void;
}

export const VariationImageStep: React.FC<VariationImageStepProps> = ({
    combinations = [],
    images = {},
    onImageChange
}) => {
    const { t } = useLanguage();

    return (
        <div style={{ padding: '0 8px' }}>
            <div style={{ marginBottom: 16, color: '#666' }}>
                {t('uploadImagesForVariations') || 'Upload images for each variation (optional)'}
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {combinations.map((combo, index) => {
                    const signature = getCombinationSignature(combo);
                    const currentImage = images[signature];

                    return (
                        <div key={index} style={{ marginBottom: 8, fontSize: 13, borderBottom: '1px solid #f0f0f0', paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ color: '#8c8c8c', minWidth: 24 }}>#{index + 1}</span>
                                <span>{combo.map(c => `${c.name}: ${c.option}`).join(', ')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {currentImage ? (
                                    <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                                        <Image
                                            src={typeof currentImage === 'string' ? currentImage : URL.createObjectURL(currentImage)}
                                            width={40}
                                            height={40}
                                            preview={false}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                bottom: 0,
                                                left: 0,
                                                background: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                            onClick={() => onImageChange?.(signature, null)}
                                        >
                                            <DeleteOutlined style={{ color: '#fff' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            onImageChange?.(signature, file);
                                            return false;
                                        }}
                                        accept="image/*"
                                    >
                                        <Button size="small" icon={<UploadOutlined />} />
                                    </Upload>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
