import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Alert, Space, Typography, Card, Divider } from 'antd';
import {
    GlobalOutlined,
    KeyOutlined,
    CheckCircleOutlined,
    EditOutlined,
    BookOutlined
} from '@ant-design/icons';
import { settingsSchema, SettingsFormData, Settings } from '../../types';
import { useSettings } from '../../providers/SettingsProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text, Title, Paragraph } = Typography;

export const WooCommerceSettings = () => {
    const { t } = useLanguage();
    const { settings, updateSettings, loading } = useSettings();
    const [editMode, setEditMode] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            woocommerceUrl: settings?.woocommerceUrl || '',
            consumerKey: '', // Don't prefill secrets for security, or prefill if needed? Old code showed placeholders.
            consumerSecret: '',
            wordpressUsername: settings?.wordpressUsername || '',
            wordpressAppPassword: ''
        }
    });

    const isConfigured = settings?.hasConsumerKey && settings?.hasConsumerSecret;

    const onSubmit = async (data: SettingsFormData) => {
        try {
            await updateSettings(data);
            setEditMode(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (isConfigured && !editMode) {
        return (
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Alert
                    message={t('credentialsConfigured') || 'המערכת מוגדרת ומחוברת כראוי!'}
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined style={{ fontSize: 24 }} />}
                    action={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditMode(true)}
                        >
                            {t('editSettings') || 'ערוך הגדרות'}
                        </Button>
                    }
                />

                <Card>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ display: 'block' }}>{t('storeURL')}</Text>
                            <Text strong>{settings?.woocommerceUrl}</Text>
                        </div>
                        <GlobalOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
                    </Space>
                </Card>
            </Space>
        );
    }

    return (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Alert
                    message={
                        <Space>
                            <BookOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            <div>
                                <Text strong>{t('needHelp') || 'צריך עזרה בהגדרה?'}</Text>
                                <div style={{ fontSize: 12 }}>צפה במדריך ההגדרה שלנו</div>
                            </div>
                        </Space>
                    }
                    type="info"
                    action={
                        <Button size="small" icon={<BookOutlined />}>
                            {t('viewGuide') || 'צפה במדריך'}
                        </Button>
                    }
                />

                <Controller
                    name="woocommerceUrl"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('storeURL')}
                            validateStatus={errors.woocommerceUrl ? 'error' : ''}
                            help={errors.woocommerceUrl?.message}
                        >
                            <Input
                                {...field}
                                prefix={<GlobalOutlined />}
                                placeholder="https://your-store.com"
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Controller
                    name="consumerKey"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('consumerKey')}
                            validateStatus={errors.consumerKey ? 'error' : ''}
                            help={errors.consumerKey?.message}
                        >
                            <Input.Password
                                {...field}
                                prefix={<KeyOutlined />}
                                placeholder={settings?.hasConsumerKey ? '••••••••••••••••' : 'ck_...'}
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Controller
                    name="consumerSecret"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('consumerSecret')}
                            validateStatus={errors.consumerSecret ? 'error' : ''}
                            help={errors.consumerSecret?.message}
                        >
                            <Input.Password
                                {...field}
                                prefix={<KeyOutlined />}
                                placeholder={settings?.hasConsumerSecret ? '••••••••••••••••' : 'cs_...'}
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Divider orientation="right">{t('wordpressIntegration') || 'חיבור וורדפרס (להעלאת תמונות)'}</Divider>

                <Controller
                    name="wordpressUsername"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('wpUsername')}
                            validateStatus={errors.wordpressUsername ? 'error' : ''}
                            help={errors.wordpressUsername?.message}
                        >
                            <Input
                                {...field}
                                prefix={<KeyOutlined />}
                                placeholder="WordPress Username"
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Controller
                    name="wordpressAppPassword"
                    control={control}
                    render={({ field }) => (
                        <Form.Item
                            label={t('appPassword')}
                            validateStatus={errors.wordpressAppPassword ? 'error' : ''}
                            help={errors.wordpressAppPassword?.message}
                        >
                            <Input.Password
                                {...field}
                                prefix={<KeyOutlined />}
                                placeholder={settings?.hasWordpressAppPassword ? '••••••••••••••••' : 'xxxx xxxx xxxx xxxx'}
                                size="large"
                            />
                        </Form.Item>
                    )}
                />

                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                >
                    {t('saveSettings') || 'שמור הגדרות'}
                </Button>
            </Space>
        </Form>
    );
};
