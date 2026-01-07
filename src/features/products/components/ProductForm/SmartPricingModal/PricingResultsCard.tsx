import React from 'react';
import { Card, Typography, Divider, Flex } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { WalletOutlined, RiseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface PricingResultsCardProps {
    calculatedPrice: number | undefined;
    profit: number | undefined;
    actualMargin: number;
    baseCost: number;
}

export const PricingResultsCard: React.FC<PricingResultsCardProps> = ({
    calculatedPrice,
    profit,
    actualMargin,
    baseCost
}) => {
    const { t } = useLanguage();

    return (
        <Card bordered={false} style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>
                    {t('optimalSellingPrice') || "OPTIMAL SELLING PRICE"}
                </Text>
                <Title level={1} style={{ margin: 0, fontSize: 48, fontWeight: 800 }}>
                    ₪{calculatedPrice?.toFixed(2) || '0.00'}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('basedOnMargin') || "Based on a"} {actualMargin.toFixed(0)}% {t('margin') || "margin"}
                </Text>
            </div>

            <div style={{ background: '#fafafa', borderRadius: 8, padding: '16px 20px' }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <WalletOutlined style={{ color: '#595959' }} />
                        <Text type="secondary">{t('baseCosts') || "Base Costs"}</Text>
                    </div>
                    <Text strong>₪{baseCost.toFixed(2)}</Text>
                </Flex>

                <Divider style={{ margin: '8px 0' }} />

                <Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RiseOutlined style={{ color: '#52c41a' }} />
                        <Text type="success">{t('netProfit') || "Net Profit"}</Text>
                    </div>
                    <Text type="success" strong>+₪{profit?.toFixed(2) || '0.00'}</Text>
                </Flex>
            </div>
        </Card>
    );
};
