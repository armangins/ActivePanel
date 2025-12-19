import { Tabs, Card, Typography } from 'antd';
import {
    ShoppingOutlined,
    ThunderboltOutlined,
    LineChartOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { WooCommerceSettings } from './tabs/WooCommerceSettings';
import { GeminiSettings } from './tabs/GeminiSettings';
import { GA4Connection } from './tabs/GA4Connection';
import { HelpSettings } from './tabs/HelpSettings';
import { ProductSettings } from './tabs/ProductSettings';
import { SystemSettings } from './tabs/SystemSettings';
import { useSettings } from '../providers/SettingsProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const { Title, Text } = Typography;

export const SettingsPage = () => {
    const { t } = useLanguage();
    const { settings, loading } = useSettings();

    const items = [
        {
            key: 'woocommerce',
            label: (
                <span>
                    <ShoppingOutlined />
                    {t('woocommerceSettings')}
                </span>
            ),
            children: <WooCommerceSettings />,
        },
        {
            key: 'gemini',
            label: (
                <span>
                    <ThunderboltOutlined />
                    {t('geminiSettings') || 'Gemini AI'}
                </span>
            ),
            children: <GeminiSettings />,
        },
        {
            key: 'ga4',
            label: (
                <span>
                    <LineChartOutlined />
                    {t('ga4Settings') || 'Google Analytics'}
                </span>
            ),
            children: <GA4Connection />,
        },
        {
            key: 'product',
            label: (
                <span>
                    <TagsOutlined />
                    {t('productSettings') || 'הגדרות מוצרים'}
                </span>
            ),
            children: <ProductSettings />,
        },
        {
            key: 'system',
            label: (
                <span>
                    <SettingOutlined />
                    {t('systemSettings') || 'מערכת'}
                </span>
            ),
            children: <SystemSettings />,
        },
        {
            key: 'help',
            label: (
                <span>
                    <QuestionCircleOutlined />
                    {t('help') || 'עזרה'}
                </span>
            ),
            children: <HelpSettings />,
        },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{t('settings')}</Title>
                <Text type="secondary">{t('settingsDesc') || 'ניהול הגדרות המערכת'}</Text>
            </div>

            <Card bordered={false} bodyStyle={{ padding: 24 }}>
                <Tabs defaultActiveKey="woocommerce" items={items} />
            </Card>
        </div>
    );
};
