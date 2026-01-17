import React, { useMemo, useEffect } from 'react';
import { Image, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCombinationSignature } from '@/features/products/utils/variationUtils';
import { useVariationStyles } from './styles';
import { VariationConfigData } from './VariationConfigurationStep';

interface VariationSummaryStepProps {
    combinations?: { id: number | string; name: string; option: string }[][];
    data: Record<string, VariationConfigData>;
    total?: number;
}

import { VariationImagePreview } from './VariationImagePreview';

export const VariationSummaryStep: React.FC<VariationSummaryStepProps> = ({
    combinations = [],
    data,
    total
}) => {
    const { t } = useLanguage();
    const styles = useVariationStyles();

    const columns: ColumnsType<any> = [
        {
            title: t('variation'),
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                        {record.combo.map((c: any) => c.name).join('/')}
                    </div>
                </div>
            )
        },
        {
            title: t('image'),
            dataIndex: 'image',
            key: 'image',
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature];
                return (
                    <div style={{ width: 32, height: 32 }}>
                        <VariationImagePreview image={rowData?.image} size={32} />
                    </div>
                );
            }
        },
        {
            title: t('regular_price'),
            dataIndex: 'regular_price',
            key: 'regular_price',
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature];
                return rowData?.regular_price ? `₪${rowData.regular_price}` : '-';
            }
        },
        {
            title: t('sale_price'),
            dataIndex: 'sale_price',
            key: 'sale_price',
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature];
                return rowData?.sale_price ? `₪${rowData.sale_price}` : '-';
            }
        },
        {
            title: t('quantity'),
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (_, record) => {
                const signature = getCombinationSignature(record.combo);
                const rowData = data[signature];
                return rowData?.stock_quantity ?? 0;
            }
        }
    ];

    const dataSource = useMemo(() => {
        return combinations.map((combo, index) => ({
            key: index,
            name: combo.map((c: any) => c.option).join(', '),
            combo
        }));
    }, [combinations]);

    return (
        <div style={{ padding: '0 8px' }}>
            <div style={styles.wizardInstructionStyle}>
                {t('reviewVariationsSummary')} ({t('total')}: {total})
            </div>

            <div style={styles.scrollableListStyle}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    size="small"
                    scroll={{ y: 400 }}
                />
            </div>
        </div>
    );
};
