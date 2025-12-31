import React from 'react';
import { Input, InputNumber, Button, Space, Divider, Row, Col, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Typography } from 'antd';

const { Text } = Typography;

export interface Expense {
    id: string;
    name: string;
    amount: number;
}

interface ExpensesSectionProps {
    expenses: Expense[];
    onAddExpense: () => void;
    onRemoveExpense: (id: string) => void;
    onUpdateExpense: (id: string, field: keyof Expense, value: any) => void;
    totalExpenses: number;
    totalCost: number;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
    expenses,
    onAddExpense,
    onRemoveExpense,
    onUpdateExpense,
    totalExpenses,
    totalCost
}) => {
    const { t } = useLanguage();

    return (
        <>
            <Divider
                orientation="left"
                plain
                style={{
                    margin: '16px 0',
                    borderColor: '#d9d9d9'
                }}
            >
                <Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {t('expenses') || "הוצאות נוספות"}
                    </Text>
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onAddExpense}
                    >
                        {t('addExpense') || "הוסף"}
                    </Button>
                </Space>
            </Divider>

            {expenses.length > 0 && (
                <Card size="small">
                    {expenses.map((expense, index) => (
                        <Row key={expense.id} gutter={[8, 8]} style={{ marginBottom: index < expenses.length - 1 ? 12 : 0 }} align="middle">
                            <Col xs={24} md={12}>
                                <Input
                                    placeholder={t('expenseName') || "שם ההוצאה"}
                                    value={expense.name}
                                    onChange={(e) => onUpdateExpense(expense.id, 'name', e.target.value)}
                                />
                            </Col>
                            <Col xs={20} md={9}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    prefix="$"
                                    placeholder="0.00"
                                    value={expense.amount}
                                    onChange={(val) => onUpdateExpense(expense.id, 'amount', val || 0)}
                                    min={0}
                                    precision={2}
                                />
                            </Col>
                            <Col xs={4} md={3} style={{ textAlign: 'center' }}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onRemoveExpense(expense.id)}
                                />
                            </Col>
                        </Row>
                    ))}

                    {expenses.length > 0 && (
                        <Divider style={{ margin: '12px 0' }} />
                    )}

                    <Row justify="end">
                        <Col>
                            <Space>
                                <Text type="secondary">{t('totalExpenses') || "סה״כ הוצאות"}:</Text>
                                <Text strong type="warning">
                                    ${totalExpenses.toFixed(2)}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {(totalExpenses > 0) && (
                <Card size="small">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text strong style={{ fontSize: 15 }}>
                                {t('totalCost') || "עלות כוללת"}
                            </Text>
                        </Col>
                        <Col>
                            <Text strong type="warning">
                                ${totalCost.toFixed(2)}
                            </Text>
                        </Col>
                    </Row>
                </Card>
            )}
        </>
    );
};
