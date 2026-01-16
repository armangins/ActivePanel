import React, { useMemo, useEffect } from 'react';
import { Input, InputNumber, Button, Upload, Image, Select, Flex, theme, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCombinationSignature } from '@/features/products/utils/variationUtils';
// import { useVariationStyles } from './styles'; // Unused

export interface VariationConfigData {
    regular_price: string;
    sale_price: string;
    stock_quantity: number | null;
    image: any;
    sku?: string;
    weight?: string;
    dimensions?: {
        length: string;
        width: string;
        height: string;
    };
}

interface VariationConfigurationStepProps {
    combinations?: { id: number | string; name: string; option: string }[][];
    data: Record<string, VariationConfigData>;
    onChange: (signature: string, field: keyof VariationConfigData, value: any) => void;

    // Manual Mode Props
    isManual?: boolean;
    onAddRow?: () => void;
    onRemoveRow?: (index: number) => void;
    onUpdateCombo?: (rowIndex: number, attrId: number | string, value: string) => void;
    activeAttributes?: any[];
}

const ImagePreview = ({ image, onRemove }: { image: any, onRemove: () => void }) => {
    const { token } = theme.useToken();

    const src = useMemo(() => {
        if (!image) return null;
        if (typeof image === 'string') return image;
        return URL.createObjectURL(image);
    }, [image]);

    useEffect(() => {
        return () => {
            if (src && typeof image !== 'string') {
                URL.revokeObjectURL(src);
            }
        };
    }, [src, image]);

    if (!src) return null;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: token.borderRadius,
            overflow: 'hidden',
            border: `1px solid ${token.colorBorder}`
        }}>
            <Image
                src={src}
                width="100%"
                height="100%"
                preview={false}
                style={{ objectFit: 'cover' }}
            />
            <Flex
                align="center"
                justify="center"
                style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    background: 'rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                onClick={onRemove}
            >
                <DeleteOutlined style={{ color: token.colorWhite }} />
            </Flex>
        </div>
    );
};



import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// ... existing imports ...

// Reuse ImagePreview logic but simplified for table cell if needed, or keep as is.
// We can define the renders directly in columns or keep helper components.

export const VariationConfigurationStep: React.FC<VariationConfigurationStepProps> = ({
    combinations = [],
    data,
    onChange,
    isManual = false,
    onAddRow,
    onRemoveRow,
    onUpdateCombo,
    activeAttributes
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    const handleImageUpload = (signature: string, file: File) => {
        onChange(signature, 'image', file);
        return false;
    };

    const columns: ColumnsType<any> = [
        {
            title: t('variation'),
            dataIndex: 'combo',
            key: 'combo',
            width: isManual ? 250 : 150,
            render: (combo, _record, index) => {
                if (isManual && activeAttributes) {
                    return (
                        <Flex gap={8} wrap="wrap">
                            {activeAttributes.map((attr: any) => {
                                const currentVal = combo.find((c: any) => c.id === attr.id)?.option;
                                return (
                                    <Select
                                        key={attr.id}
                                        style={{ width: 100 }}
                                        placeholder={attr.name}
                                        value={currentVal}
                                        onChange={(val) => onUpdateCombo && onUpdateCombo(index, attr.id, val)}
                                        options={(attr.options || []).map((opt: string) => ({ label: opt, value: opt }))}
                                        size="small"
                                    />
                                );
                            })}
                        </Flex>
                    );
                }
                return (
                    <Typography.Text strong>
                        {combo.map((c: any) => c.option).join(' / ')}
                    </Typography.Text>
                );
            }
        },
        {
            title: t('image'),
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature] || {};

                return (
                    <div style={{ width: 50, height: 50 }}>
                        {rowData.image ? (
                            <ImagePreview
                                image={rowData.image}
                                onRemove={() => onChange(signature, 'image', null)}
                            />
                        ) : (
                            <Upload
                                beforeUpload={(file) => handleImageUpload(signature, file)}
                                showUploadList={false}
                            >
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    border: `1px dashed ${token.colorBorder}`,
                                    borderRadius: token.borderRadius,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: token.colorFillQuaternary
                                }}>
                                    <UploadOutlined style={{ color: token.colorTextSecondary }} />
                                </div>
                            </Upload>
                        )}
                    </div>
                );
            }
        },
        {
            title: t('regular_price'),
            dataIndex: 'regular_price',
            key: 'regular_price',
            width: 150,
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature] || {};
                const isError = !rowData.regular_price; // Required field

                return (
                    <Input
                        prefix="₪"
                        placeholder="0.00"
                        value={rowData.regular_price}
                        onChange={e => onChange(signature, 'regular_price', e.target.value)}
                        status={isError ? 'error' : ''}
                    />
                );
            }
        },
        {
            title: t('sale_price'),
            dataIndex: 'sale_price',
            key: 'sale_price',
            width: 150,
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature] || {};

                return (
                    <Input
                        prefix="₪"
                        placeholder="0.00"
                        value={rowData.sale_price}
                        onChange={e => onChange(signature, 'sale_price', e.target.value)}
                    />
                );
            }
        },
        {
            title: t('quantity'),
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            width: 120,
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature] || {};
                // Check if null or undefined explicitly, allows 0
                const isError = rowData.stock_quantity === null || rowData.stock_quantity === undefined;

                return (
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="0"
                        value={rowData.stock_quantity ?? undefined}
                        onChange={val => onChange(signature, 'stock_quantity', val)}
                        status={isError ? 'error' : ''}
                    />
                );
            }
        },
    ];

    if (isManual) {
        columns.push({
            title: '',
            key: 'action',
            width: 50,
            render: (_, _record, index) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveRow && onRemoveRow(index)}
                />
            )
        });
    }

    const dataSource = useMemo(() => {
        return combinations.map((combo, index) => ({
            key: index,
            combo
        }));
    }, [combinations]);

    return (
        <div style={{ minHeight: 300 }}>
            <div style={{ marginBottom: token.marginSM }}>
                <Typography.Text type="secondary">
                    {isManual ? t('configureVariationsManualDesc') : t('configureVariationsDesc')}
                </Typography.Text>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ y: 400 }}
                size="small"
                bordered
            />

            {isManual && (
                <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={onAddRow}
                    style={{ marginTop: token.marginSM }}
                >
                    {t('addVariationRow')}
                </Button>
            )}
        </div>
    );
};
