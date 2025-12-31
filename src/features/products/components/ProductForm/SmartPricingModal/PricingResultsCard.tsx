import React from 'react';
import { Row, Col, Statistic, Card, Tag } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingResultsCardProps {
    calculatedPrice: number | undefined;
    profit: number | undefined;
    actualMargin: number;
}

export const PricingResultsCard: React.FC<PricingResultsCardProps> = ({
    calculatedPrice,
    profit,
    actualMargin
}) => {
    const { t } = useLanguage();

    return (
        <Card>
            <Row gutter={16} align="middle">
                <Col xs={12} sm={12}>
                    <Statistic
                        title={t('recommendedPrice') || "מחיר מומלץ"}
                        value={calculatedPrice ?? '-'}
                        precision={2}
                        prefix="$"
                    />
                </Col>
                <Col xs={12} sm={12}>
                    <Statistic
                        title={t('estimatedProfit') || "רווח משוער"}
                        value={profit ?? '-'}
                        precision={2}
                        prefix="$"
                    />
                    {actualMargin > 0 && (
                        <Tag color="success" style={{ marginTop: 8 }}>
                            {actualMargin.toFixed(1)}% {t('margin') || "רווח"}
                        </Tag>
                    )}
                </Col>
            </Row>
        </Card>
    );
};
