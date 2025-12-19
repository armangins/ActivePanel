import { Button, Card, Typography, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Variation } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface VariationCardProps {
    variation: Variation;
    onEdit: (variation: Variation) => void;
    onDelete: (variation: Variation) => void;
}

export const VariationCard = ({ variation, onEdit, onDelete }: VariationCardProps) => {
    const { t, isRTL } = useLanguage();

    const attributesString = variation.attributes
        .map(attr => `${attr.name}: ${attr.option}`)
        .join(', ');

    return (
        <Card size="small" style={{ marginBottom: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space direction="vertical" size={0}>
                    <Text strong>{attributesString || `#${variation.id}`}</Text>
                    <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">SKU: {variation.sku || '-'}</Text>
                        <Text>
                            {variation.sale_price ? (
                                <>
                                    <Text delete type="secondary" style={{ marginRight: 4 }}>{variation.regular_price}</Text>
                                    <Text type="danger">{variation.sale_price}</Text>
                                </>
                            ) : (
                                variation.regular_price
                            )}
                        </Text>
                        <Tag color={variation.stock_status === 'instock' ? 'success' : 'error'}>
                            {t(variation.stock_status) || variation.stock_status}
                        </Tag>
                        {variation.stock_quantity !== null && (
                            <Text type="secondary">Qty: {variation.stock_quantity}</Text>
                        )}
                    </Space>
                </Space>

                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(variation)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(variation)}
                    />
                </Space>
            </div>
        </Card>
    );
};
