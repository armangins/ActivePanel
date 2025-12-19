import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, Typography } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { SalesChartData } from '../types';

const { Title } = Typography;

interface EarningsChartProps {
    data: SalesChartData[];
}

export const EarningsChart = ({ data }: EarningsChartProps) => {
    const { t } = useLanguage();

    return (
        <Card title={t('earnings') || 'Earnings'}>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthName" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: number) => [`$${value.toFixed(2)}`, t('earnings') || 'Earnings']}
                        />
                        <Bar dataKey="earnings" fill="#1890ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
