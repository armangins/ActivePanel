import { Button, Typography, Space, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text, Paragraph } = Typography;

interface SystemSettingsProps {
    onClearCache?: () => void;
}

export const SystemSettings = ({ onClearCache }: SystemSettingsProps) => {
    const { t } = useLanguage();

    const handleClear = () => {
        Modal.confirm({
            title: t('clearCache') || 'Clear Cache',
            content: t('clearCacheConfirm') || 'Are you sure you want to clear all cached data? This will force the app to reload all data from the server.',
            okText: t('yes') || 'Yes',
            cancelText: t('no') || 'No',
            onOk: () => {
                if (onClearCache) {
                    onClearCache();
                } else {
                    window.location.reload();
                }
            }
        });
    };

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
                <Paragraph>
                    {t('cacheManagementDesc') || 'נקה נתונים שמורים ב-Cache כדי לטעון מחדש מהשרת. זה יכול לעזור אם הנתונים נראים לא מעודכנים.'}
                </Paragraph>
                <Button
                    onClick={handleClear}
                    danger
                    icon={<DeleteOutlined />}
                    size="large"
                >
                    {t('clearCache') || 'נקה Cache'}
                </Button>
            </div>
        </Space>
    );
};
