import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Row, Col, theme } from 'antd';
import { InfoCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PricingInputSection } from './PricingInputSection';
import { PricingResultsCard } from './PricingResultsCard';

const { Text } = Typography;


interface SmartPricingModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyPrice: (price: number) => void;
}


export const SmartPricingModal: React.FC<SmartPricingModalProps> = ({
    visible,
    onClose,
    onApplyPrice
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    const [cost, setCost] = useState<number>();
    const [margin, setMargin] = useState<number>(30); // Default 30% margin
    const [expenses, setExpenses] = useState<Array<{ id: string; amount: number }>>([{ id: '1', amount: 0 }]);
    const [calculatedPrice, setCalculatedPrice] = useState<number>();
    const [profit, setProfit] = useState<number>();

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalCost = (cost || 0) + totalExpenses;

    // Effect to recalculate when inputs change
    useEffect(() => {
        // Formula: Price = TotalCost / (1 - Margin%)
        const baseCost = (cost || 0) + totalExpenses;
        const marginDecimal = margin / 100;

        // Prevent division by zero or invalid margins
        if (marginDecimal >= 1 || marginDecimal < 0) {
            setCalculatedPrice(0);
            setProfit(0);
            return;
        }

        const finalPrice = baseCost / (1 - marginDecimal);

        setCalculatedPrice(Number(finalPrice.toFixed(2)));
        // Profit is (FinalPrice - TotalCost)
        setProfit(Number((finalPrice - baseCost).toFixed(2)));
    }, [cost, margin, totalExpenses]);

    const handleAddExpense = () => {
        setExpenses([...expenses, { id: Date.now().toString(), amount: 0 }]);
    };

    const handleRemoveExpense = (id: string) => {
        if (expenses.length > 1) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handleUpdateExpense = (id: string, value: number) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, amount: value } : e));
    };

    const handleApply = () => {
        if (!calculatedPrice || calculatedPrice <= 0) return;
        onApplyPrice(calculatedPrice);
        onClose();
    };

    const handleReset = () => {
        setCost(0);
        setMargin(30);
        setExpenses([{ id: '1', amount: 0 }]);
    };

    // Calculate actual margin percentage: (Profit / Price) * 100
    const actualMargin = (calculatedPrice && profit && calculatedPrice > 0) ? ((profit / calculatedPrice) * 100) : 0;


    return (
        <Modal
            title={null}
            footer={
                <div style={{ display: 'flex', gap: token.margin, justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"

                        onClick={handleApply}
                        disabled={!calculatedPrice || calculatedPrice <= 0}
                    >
                        השתמש במחיר זה עבור המוצר
                    </Button>
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={900}
            centered
            styles={{ body: { padding: 0, overflow: 'hidden' } }}
        >
            <div style={{
                padding: `${token.paddingLG}px ${token.paddingLG}px ${token.padding}px`,
                borderBottom: `1px solid ${token.colorBorder}`
            }}>
                <Typography.Title level={2} style={{ margin: 0, marginBottom: token.marginXS }}>
                    {t('priceYourProduct')}
                </Typography.Title>
                <Text type="secondary" style={{ fontSize: token.fontSize }}>
                    {t('priceYourProductDesc')}
                </Text>
            </div>

            <div style={{ padding: token.paddingLG }}>
                <Row gutter={32}>
                    <Col xs={24} md={14}>
                        <PricingInputSection
                            cost={cost}
                            margin={margin}
                            expenses={expenses}
                            onCostChange={setCost}
                            onMarginChange={setMargin}
                            onAddExpense={handleAddExpense}
                            onRemoveExpense={handleRemoveExpense}
                            onUpdateExpense={handleUpdateExpense}
                        />

                        {/* Tip Section */}
                        <div style={{
                            marginTop: token.marginLG,
                            padding: `${token.paddingLG}px ${token.padding}px`,
                            background: token.colorBgLayout,
                            borderRadius: token.borderRadius,
                            display: 'flex',
                            gap: token.marginSM
                        }}>
                            <InfoCircleOutlined style={{
                                color: token.colorWarning,
                                fontSize: token.fontSizeLG,
                                marginTop: token.marginXXS
                            }} />
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: token.marginXXS }}>
                                    {t('pricingTip')}
                                </Text>
                                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                    {t('pricingTipDesc')}
                                </Text>
                            </div>
                        </div>

                    </Col>

                    <Col xs={24} md={10}>
                        <PricingResultsCard
                            calculatedPrice={calculatedPrice}
                            profit={profit}
                            actualMargin={actualMargin}
                            baseCost={totalCost}
                        />

                        <div style={{
                            marginTop: token.marginLG,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: token.marginLG
                        }}>
                            <Button
                                type="text"
                                icon={<CalculatorOutlined />}
                                onClick={handleReset}
                            >
                                {t('reset')}
                            </Button>

                            <Button
                                type="text"
                                onClick={onClose}
                            >
                                {t('export')}
                            </Button>
                        </div>

                    </Col>
                </Row>
            </div>
        </Modal>
    );
};
