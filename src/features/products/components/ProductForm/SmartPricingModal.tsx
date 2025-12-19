import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, Input, Form, Typography, Button, Space, Divider, Row, Col, Statistic, Tooltip, Table } from 'antd';
import { CalculatorOutlined, ThunderboltOutlined, InfoCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface SmartPricingModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyPrice: (price: number) => void;
    currentPrice?: number;
}

interface Expense {
    id: string;
    name: string;
    amount: number;
}

export const SmartPricingModal: React.FC<SmartPricingModalProps> = ({
    visible,
    onClose,
    onApplyPrice,
    currentPrice
}) => {
    const { t } = useLanguage();
    const [cost, setCost] = useState<number | null>(null);
    const [markup, setMarkup] = useState<number>(50); // Default 50% markup
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
    const [profit, setProfit] = useState<number>(0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalCost = (cost || 0) + totalExpenses;

    // Effect to recalculate when inputs change
    useEffect(() => {
        if (cost !== null) {
            // Formula: Price = (Cost + Expenses) * (1 + Markup/100)
            const baseCost = (cost || 0) + totalExpenses;
            const finalPrice = baseCost * (1 + markup / 100);

            setCalculatedPrice(Number(finalPrice.toFixed(2)));
            // Profit is (FinalPrice - TotalCost)
            setProfit(Number((finalPrice - baseCost).toFixed(2)));
        }
    }, [cost, markup, expenses, totalExpenses]);

    const handleApply99 = () => {
        const floored = Math.floor(calculatedPrice);
        const newPrice = floored + 0.99;
        setCalculatedPrice(newPrice);

        if (totalCost > 0) {
            // Reverse calculate Markup
            // Price = TotalCost * (1+M)
            // Price / TotalCost = 1+M
            // (Price / TotalCost) - 1 = M
            const newMarkup = ((newPrice / totalCost) - 1) * 100;
            setMarkup(Number(newMarkup.toFixed(1)));
            setProfit(Number((newPrice - totalCost).toFixed(2)));
        }
    };

    const handleAddExpense = () => {
        setExpenses([...expenses, { id: Date.now().toString(), name: '', amount: 0 }]);
    };

    const handleRemoveExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const handleUpdateExpense = (id: string, field: keyof Expense, value: any) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleApply = () => {
        onApplyPrice(calculatedPrice);
        onClose();
    };

    return (
        <Modal
            title={
                <Space>
                    <CalculatorOutlined style={{ color: '#1890ff' }} />
                    {t('smartPricingAssistant') || "Smart Pricing Assistant"}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('cancel')}
                </Button>,
                <Button key="apply" type="primary" onClick={handleApply} disabled={!calculatedPrice}>
                    {t('applyPrice') || "Apply Price"}
                </Button>
            ]}
            width={600}
        >
            <div style={{ marginBottom: 24 }}>
                <Text type="secondary">
                    {t('smartPricingHelp') || "Calculate the optimal product price based on your cost and desired markup."}
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={12}>
                    <Form.Item label={t('costPrice') || "Cost Price ($)"}>
                        <InputNumber
                            style={{ width: '100%' }}
                            prefix="$"
                            value={cost}
                            onChange={(val) => setCost(val)}
                            placeholder="0.00"
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label={
                            <Space>
                                {t('markupPercentage') || "Markup %"}
                                <Tooltip title="Markup = (Price - Total Cost) / Total Cost">
                                    <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                                </Tooltip>
                            </Space>
                        }
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            value={markup}
                            onChange={(val) => setMarkup(val || 0)}
                            addonAfter="%"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Divider dashed style={{ margin: '12px 0' }} orientation="left" plain>
                <Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>{t('expenses') || "Additional Expenses"}</Text>
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddExpense}>
                        {t('addExpense') || "Add"}
                    </Button>
                </Space>
            </Divider>

            {expenses.map((expense) => (
                <Row key={expense.id} gutter={8} style={{ marginBottom: 8 }} align="middle">
                    <Col span={12}>
                        <Input
                            placeholder={t('expenseName') || "Expense Name"}
                            value={expense.name}
                            onChange={(e) => handleUpdateExpense(expense.id, 'name', e.target.value)}
                        />
                    </Col>
                    <Col span={8}>
                        <InputNumber
                            style={{ width: '100%' }}
                            prefix="$"
                            placeholder={t('expenseAmount') || "Amount"}
                            value={expense.amount}
                            onChange={(val) => handleUpdateExpense(expense.id, 'amount', val)}
                        />
                    </Col>
                    <Col span={4}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveExpense(expense.id)}
                        />
                    </Col>
                </Row>
            ))}

            {expenses.length > 0 && (
                <Row style={{ marginBottom: 24 }} justify="end">
                    <Col>
                        <Text type="secondary">{t('totalCost') || "Total Cost"}: </Text>
                        <Text strong>${totalCost.toFixed(2)}</Text>
                    </Col>
                </Row>
            )}

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Statistic
                            title={t('recommendedPrice') || "Recommended Price"}
                            value={calculatedPrice}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        />
                    </Col>
                    <Col>
                        <Statistic
                            title={t('estimatedProfit') || "Est. Profit"}
                            value={profit}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                        />
                    </Col>
                </Row>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="dashed"
                    icon={<ThunderboltOutlined />}
                    onClick={handleApply99}
                    disabled={!calculatedPrice}
                >
                    {t('applyPsychologicalPricing') || "Apply .99 Ending"}
                </Button>
            </div>
        </Modal>
    );
};
