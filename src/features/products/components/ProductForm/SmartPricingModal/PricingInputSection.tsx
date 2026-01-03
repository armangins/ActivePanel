import React from 'react';
import { Form, InputNumber, Slider, Row, Col, Typography, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { theme } from 'antd';

const { Text } = Typography;

interface PricingInputSectionProps {
    cost: number | undefined;
    margin: number;
    expenses: Array<{ id: string; amount: number }>;
    onCostChange: (value: number | undefined) => void;
    onMarginChange: (value: number) => void;
    onAddExpense: () => void;
    onRemoveExpense: (id: string) => void;
    onUpdateExpense: (id: string, value: number) => void;
}

export const PricingInputSection: React.FC<PricingInputSectionProps> = ({
    cost,
    margin,
    expenses,
    onCostChange,
    onMarginChange,
    onAddExpense,
    onRemoveExpense,
    onUpdateExpense
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Text strong style={{ display: 'block', marginBottom: token.marginXS }}>
                        {t('productCost') || 'Product Cost'} ($)
                    </Text>
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
                </Col>
                <Col span={12}>
                    <Text strong style={{ display: 'block', marginBottom: token.marginXS }}>
                        {t('additionalExpenses') || 'Additional Expenses'} ($)
                    </Text>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {expenses.map((expense, index) => (
                            <Space.Compact key={expense.id} style={{ width: '100%' }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    prefix="$"
                                    value={expense.amount}
                                    onChange={(val) => onUpdateExpense(expense.id, val as number || 0)}
                                    placeholder="0.00"
                                    precision={2}
                                    size="large"
                                />
                                {expenses.length > 1 && (
                                    <Button
                                        size="large"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => onRemoveExpense(expense.id)}
                                    />
                                )}
                                {index === expenses.length - 1 && (
                                    <Button
                                        size="large"
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={onAddExpense}
                                    />
                                )}
                            </Space.Compact>
                        ))}
                    </Space>
                </Col>
            </Row>

            <div style={{ marginTop: token.marginLG }}>
                <Text strong style={{ display: 'block', marginBottom: token.marginXS }}>
                    {t('targetProfitMargin')}
                </Text>
                <Slider
                    min={0}
                    max={100}
                    value={margin}
                    onChange={onMarginChange}
                    marks={{
                        0: '0%',
                        50: '50%',
                        100: '100%'
                    }}
                />
            </div>
        </>
    );
};
