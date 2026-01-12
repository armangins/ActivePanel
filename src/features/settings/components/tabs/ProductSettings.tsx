import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, InputNumber, Button, Typography, Space } from 'antd';
import { settingsSchema, SettingsFormData } from '@/features/settings/types';
import { useSettings } from '@/features/settings/providers/SettingsProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

export const ProductSettings = () => {
    const { t } = useLanguage();
    const { settings, updateSettings, loading } = useSettings();

    const { control, handleSubmit, formState: { errors } } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            lowStockThreshold: settings?.lowStockThreshold || 2
        }
    });

    const onSubmit = async (data: SettingsFormData) => {
        try {
            await updateSettings(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Controller
                    name="lowStockThreshold"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('lowStockThreshold') || 'סף מלאי נמוך'}
                            validateStatus={errors.lowStockThreshold ? 'error' : ''}
                            help={errors.lowStockThreshold?.message}
                        >
                            <InputNumber
                                {...field}
                                style={{ width: '100%' }}
                                min={0}
                                precision={0}
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Text type="secondary">
                    {t('lowStockThresholdDesc') || 'מוצרים עם מלאי שווה או נמוך מהערך הזה ייחשבו כמוצרים במלאי נמוך (כולל מוצרים אזלו מהמלאי)'}
                </Text>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {t('save') || 'שמור'}
                    </Button>
                </div>
            </Space>
        </Form>
    );
};
