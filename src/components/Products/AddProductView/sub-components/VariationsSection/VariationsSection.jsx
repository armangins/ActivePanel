import { useCallback, useMemo, memo } from 'react';
import { PlusOutlined as Plus, CloseOutlined as X, AppstoreOutlined as Boxes } from '@ant-design/icons';
import { Card, Button, Typography, Row, Col, Empty, Spin, Badge, Flex, Popconfirm, Tooltip } from 'antd';
import VariationCard from '../../../VariationCard/VariationCard';
import { mapVariationToDisplay } from '../../utils/productBuilders';

const { Title, Text } = Typography;

/**
 * VariationsSection Component
 * Refactored to use standard Ant Design components
 */
const VariationsSection = ({
    variations = [],
    pendingVariations = [],
    loading = false,
    isEditMode = false,
    onAddClick,
    onVariationClick,
    onDeletePending,
    onDeleteVariation,
    formatCurrency,
    isRTL,
    t,
}) => {
    const hasVariations = variations.length > 0 || pendingVariations.length > 0;

    // Render a single variation item (pending or saved)
    const renderVariationItem = useCallback((variation, isPending) => {
        // Map properties for pending variations to match expected structure
        const displayVariation = mapVariationToDisplay(variation, isPending);

        const content = (
            <div
                onClick={() => onVariationClick?.(variation)}
                style={{ cursor: 'pointer', position: 'relative', height: '100%' }}
            >
                <VariationCard
                    variation={displayVariation}
                    formatCurrency={formatCurrency}
                    isRTL={isRTL}
                    t={t}
                />

                {/* Delete Button */}
                {(isPending || isEditMode) && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                        {isPending ? (
                            <Button
                                type="text"
                                size="small"
                                shape="circle"
                                icon={<X />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePending?.(variation.id);
                                }}
                                style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#ff4d4f' }}
                            />
                        ) : (
                            <Popconfirm
                                title={t('deleteVariation') || 'מחק וריאציה'}
                                description={t('confirmDeleteVariation') || 'האם אתה בטוח שברצונך למחוק וריאציה זו?'}
                                onConfirm={(e) => {
                                    e.stopPropagation();
                                    onDeleteVariation?.(variation.id);
                                }}
                                onCancel={(e) => e.stopPropagation()}
                                okText={t('yes') || 'כן'}
                                cancelText={t('no') || 'לא'}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    shape="circle"
                                    icon={<X />}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#ff4d4f' }}
                                />
                            </Popconfirm>
                        )}
                    </div>
                )}
            </div>
        );

        return (
            <Col xs={24} sm={12} md={8} key={variation.id}>
                {isPending ? (
                    <Badge.Ribbon text={t('pending') || 'ממתין'} color="gold">
                        {content}
                    </Badge.Ribbon>
                ) : (
                    content
                )}
            </Col>
        );
    }, [onVariationClick, onDeletePending, onDeleteVariation, formatCurrency, isRTL, t, isEditMode]);

    return (
        <Card
            bodyStyle={{ padding: '24px' }}
            title={
                <Flex justify="space-between" align="center" style={{ flexDirection: 'row' }}>
                    <Flex align="center" gap="small" style={{ flexDirection: 'row' }}>
                        <Boxes style={{ fontSize: '20px', color: '#595959' }} />
                        <Title level={4} style={{ margin: 0 }}>וריאציות</Title>
                    </Flex>
                    {onAddClick && (
                        <Button type="primary" onClick={onAddClick}>
                            {t('addVariation') || 'צור וריאציה'}
                        </Button>
                    )}
                </Flex>
            }
        >
            {loading ? (
                <Flex justify="center" align="center" vertical style={{ padding: '32px' }}>
                    <Spin size="large" />
                    <Text type="secondary" style={{ marginTop: '16px' }}>{t('loading') || 'טוען...'}</Text>
                </Flex>
            ) : !hasVariations ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Text type="secondary">
                            {t('noVariationsYet') || 'אין לכם וריאציות עדיין, לחצו על הוסף וריאציה כדי להתחיל'}
                        </Text>
                    }
                />
            ) : (
                <Row gutter={[16, 16]}>
                    {pendingVariations.map(variation => renderVariationItem(variation, true))}
                    {variations.map(variation => renderVariationItem(variation, false))}
                </Row>
            )}
        </Card>
    );
};

export default memo(VariationsSection);

