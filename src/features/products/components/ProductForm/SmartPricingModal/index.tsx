import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Popover, Typography, Grid } from 'antd';
import { InfoCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PricingInputSection } from './PricingInputSection';
import { ExpensesSection, type Expense } from './ExpensesSection';
import { PricingResultsCard } from './PricingResultsCard';

const { Text } = Typography;
const { useBreakpoint } = Grid;

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
    const screens = useBreakpoint();
    const [cost, setCost] = useState<number>();
    const [margin, setMargin] = useState<number>(30); // Default 30% margin
    const [expenses, setExpenses] = useState<Expense[]>([]);
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
    }, [cost, margin, expenses, totalExpenses]);

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
        if (!calculatedPrice || calculatedPrice <= 0) return;
        onApplyPrice(calculatedPrice);
        onClose();
    };

    const handleReset = () => {
        setCost(0);
        setMargin(30);
        setExpenses([]);
    };

    // Calculate actual margin percentage: (Profit / Price) * 100
    const actualMargin = (calculatedPrice && profit && calculatedPrice > 0) ? ((profit / calculatedPrice) * 100) : 0;

    return (
        <Modal
            title={
                <Space>
                    <CalculatorOutlined />
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        מחשבון תמחור חכם
                    </Typography.Title>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="reset" onClick={handleReset}>
                    {t('reset') || "איפוס"}
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    {t('cancel') || "ביטול"}
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={handleApply}
                    disabled={!calculatedPrice || calculatedPrice <= 0}
                >
                    השתמש במחיר זה
                </Button>
            ]}
            width={screens.md ? 700 : '95%'}
            centered
        >
            {/* Help Button */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Popover
                    content={
                        <Space direction="vertical" size="small" style={{ maxWidth: screens.xs ? 260 : 350 }}>
                            <Text>
                                אחוז הרווח הוא <Text strong>אחוז הרווח מהמחיר הסופי</Text>, לא מהעלות.
                            </Text>
                            <Space direction="vertical" size="small" style={{
                                background: '#f0f5ff',
                                padding: 12,
                                borderRadius: 6,
                                border: '1px solid #adc6ff',
                                width: '100%'
                            }}>
                                <Text strong type="secondary">
                                    📊 דוגמה: עלות 100₪, רווח 50%
                                </Text>
                                <Space direction="vertical" size={4}>
                                    <Text type="secondary">
                                        • <Text strong>מחיר סופי:</Text> 100 ÷ (1 - 0.5) = <Text strong type="success">200₪</Text>
                                    </Text>
                                    <Text type="secondary">
                                        • <Text strong>רווח:</Text> 200 - 100 = <Text strong type="success">100₪</Text>
                                    </Text>
                                    <Text type="secondary">
                                        • <Text strong>אחוז רווח מהמחיר:</Text> 100 ÷ 200 = <Text strong type="success">50%</Text> ✓
                                    </Text>
                                </Space>
                            </Space>
                        </Space>
                    }
                    title={
                        <Space>
                            <InfoCircleOutlined />
                            <span>איך החישוב עובד?</span>
                        </Space>
                    }
                    trigger="click"
                    placement="bottom"
                >
                    <Button
                        type="link"
                        icon={<InfoCircleOutlined />}
                        size="small"
                    >
                        איך החישוב עובד?
                    </Button>
                </Popover>

                {/* Input Section */}
                <PricingInputSection
                    cost={cost}
                    margin={margin}
                    onCostChange={setCost}
                    onMarginChange={setMargin}
                />

                {/* Expenses Section */}
                <ExpensesSection
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onRemoveExpense={handleRemoveExpense}
                    onUpdateExpense={handleUpdateExpense}
                    totalExpenses={totalExpenses}
                    totalCost={totalCost}
                />

                {/* Results Section */}
                <PricingResultsCard
                    calculatedPrice={calculatedPrice}
                    profit={profit}
                    actualMargin={actualMargin}
                />
            </Space>
        </Modal>
    );
};
