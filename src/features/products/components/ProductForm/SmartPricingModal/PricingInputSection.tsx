import React from 'react';
import { Form, InputNumber, Input, Space, Row, Col, Tooltip, Card } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingInputSectionProps {
    cost: number | undefined;
    margin: number;
    onCostChange: (value: number | undefined) => void;
    onMarginChange: (value: number) => void;
}

export const PricingInputSection: React.FC<PricingInputSectionProps> = ({
    cost,
    margin,
    onCostChange,
    onMarginChange
}) => {
    const { t } = useLanguage();

    return (
        <Card size="small">            <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Form.Item
                    label={
                        <span style={{ fontWeight: 500 }}>
                            {t('costPrice') || "מחיר עלות ($)"}
                        </span>
                    }
                    style={{ marginBottom: 0 }}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        prefix="$"
                        value={cost}
                        onChange={(val) => onCostChange(val as number)}
                        placeholder="0.00"
                        min={0}
                        precision={2}
                        size="large"
                    />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item
                    label={
                        <Space>
                            <span style={{ fontWeight: 500 }}>
                                {t('marginPercentage') || "אחוז רווח מהמחיר הסופי (%)"}
                            </span>
                            <Tooltip title={
                                <div>
                                    <div>נוסחה: מחיר = עלות ÷ (1 - רווח%)</div>
                                    <div style={{ marginTop: 4 }}>דוגמה: 100₪ ÷ (1 - 0.5) = 200₪</div>
                                </div>
                            }>
                                <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                            </Tooltip>
                        </Space>
                    }
                    style={{ marginBottom: 0 }}
                >
                    <Space.Compact style={{ width: '100%' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            value={margin}
                            onChange={(val) => onMarginChange(val || 0)}
                            min={0}
                            max={99}
                            precision={1}
                            size="large"
                        />
                        <Input
                            style={{ width: '50px', textAlign: 'center' }}
                            value="%"
                            disabled
                            size="large"
                        />
                    </Space.Compact>
                </Form.Item>
            </Col>
        </Row>
        </Card>
    );
};
