import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Alert, Space, Typography, Card } from 'antd';
import { GlobalOutlined as Globe, KeyOutlined as Key, ReloadOutlined as Loader, CheckCircleOutlined as CheckCircle, EditOutlined as Pencil, BookOutlined as BookOpenIcon } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';

const { Title, Text, Paragraph } = Typography;

const WooCommerceSettings = ({ configuredCredentials = {}, onTestConnection, testing }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { control, watch, formState: { errors } } = useFormContext();
    const [showFields, setShowFields] = useState(false);

    const woocommerceUrl = watch('woocommerceUrl');

    // Check if all credentials are configured
    const allConfigured = configuredCredentials.hasConsumerKey &&
        configuredCredentials.hasConsumerSecret &&
        configuredCredentials.hasWordpressUsername &&
        configuredCredentials.hasWordpressAppPassword;

    // If all configured and user hasn't clicked "edit", show success state
    if (allConfigured && !showFields) {
        return (
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* Success Message */}
                <Alert
                    message={t('credentialsConfigured') || 'איזה כיף! ההגדרות שלך תקינות אפשר להתחיל לעבוד!'}
                    type="success"
                    icon={<CheckCircle style={{ fontSize: 24 }} />}
                    showIcon
                    action={
                        <Button
                            onClick={() => setShowFields(true)}
                            type="primary"
                            icon={<Pencil />}
                        >
                            {t('editSettings') || 'ערוך הגדרות'}
                        </Button>
                    }
                    style={{ textAlign: 'center' }}
                />

                {/* Store URL Display (always visible) */}
                <Card>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                                {t('storeURL')}
                            </Text>
                            <Text strong>{woocommerceUrl}</Text>
                        </div>
                        <Globe style={{ fontSize: 20, color: '#bfbfbf' }} />
                    </Space>
                </Card>
            </Space>
        );
    }

    // Show full form (either not configured or user clicked "edit")
    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }} data-onboarding="woocommerce-settings">
            {/* Setup Guide Link */}
            <Alert
                message={
                    <Space>
                        <BookOpenIcon style={{ fontSize: 20, color: '#1890ff' }} />
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 14 }}>
                                צריך עזרה בהגדרה?
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                צפה במדריך ההגדרה שלנו שלב אחר שלב
                            </Text>
                        </div>
                    </Space>
                }
                type="info"
                action={
                    <Button
                        onClick={() => navigate('/settings/woocommerce-setup')}
                        size="small"
                        icon={<BookOpenIcon />}
                    >
                        צפה במדריך
                    </Button>
                }
            />

            <div>
                <Controller
                    name="woocommerceUrl"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="woocommerce-url"
                            name={field.name}
                            value={field.value || ''}
                            label={t('storeURL')}
                            type="url"
                            placeholder={t('enterStoreURL') || 'https://your-store.com'}
                            leftIcon={Globe}
                            autoComplete="url"
                            error={errors.woocommerceUrl?.message}
                            onChange={(e) => {
                                const value = e.target ? e.target.value : e;
                                field.onChange(value);
                            }}
                            onBlur={(e) => {
                                let value = e.target ? e.target.value : field.value;
                                // Remove leading slash if present
                                if (value && value.startsWith('/')) {
                                    value = value.substring(1);
                                }
                                // Trim whitespace only on blur
                                if (value) {
                                    value = value.trim();
                                }
                                field.onChange(value);
                                field.onBlur();
                            }}
                            ref={field.ref}
                        />
                    )}
                />
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    {t('enterStoreURL')}
                </Text>
            </div>

            <div>
                <Controller
                    name="consumerKey"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="consumer-key"
                            name={field.name}
                            value={field.value || ''}
                            label={t('consumerKey')}
                            type="password"
                            placeholder={configuredCredentials.hasConsumerKey ? t('credentialConfigured') : "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                            leftIcon={Key}
                            autoComplete="username"
                            error={errors.consumerKey?.message}
                            onChange={(e) => {
                                const value = e.target ? e.target.value : e;
                                field.onChange(value);
                            }}
                            onBlur={(e) => {
                                let value = e.target ? e.target.value : field.value;
                                if (value) {
                                    value = value.trim();
                                }
                                field.onChange(value);
                                field.onBlur();
                            }}
                            ref={field.ref}
                        />
                    )}
                />
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    {t('yourConsumerKey')}
                </Text>
            </div>

            <div>
                <Controller
                    name="consumerSecret"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="consumer-secret"
                            name={field.name}
                            value={field.value || ''}
                            label={t('consumerSecret')}
                            type="password"
                            placeholder={configuredCredentials.hasConsumerSecret ? t('credentialConfigured') : "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                            leftIcon={Key}
                            autoComplete="current-password"
                            error={errors.consumerSecret?.message}
                            onChange={(e) => {
                                const value = e.target ? e.target.value : e;
                                field.onChange(value);
                            }}
                            onBlur={(e) => {
                                let value = e.target ? e.target.value : field.value;
                                if (value) {
                                    value = value.trim();
                                }
                                field.onChange(value);
                                field.onBlur();
                            }}
                            ref={field.ref}
                        />
                    )}
                />
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    {t('yourConsumerSecret')}
                </Text>
            </div>

            {/* WordPress Integration Section */}
            <div style={{ paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                <Title level={5} style={{ marginBottom: 16, textAlign: 'right' }}>
                    {t('wordpressIntegration') || 'WordPress Integration'}
                </Title>
                <Paragraph style={{ textAlign: 'right', marginBottom: 16, fontSize: 14, color: '#595959' }}>
                    {t('wpAppPasswordDesc') || 'נדרש להעלאת תמונות. קבל אותו מ-WordPress: משתמשים → פרופיל → סיסמאות אפליקציה'}
                </Paragraph>

                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <div>
                        <Controller
                            name="wordpressUsername"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="wordpress-username"
                                    name={field.name}
                                    value={field.value || ''}
                                    label={t('wpUsername') || 'WordPress Username'}
                                    type="text"
                                    placeholder={configuredCredentials.hasWordpressUsername ? t('credentialConfigured') : (t('wpUsernamePlaceholder') || 'your-wordpress-username')}
                                    leftIcon={Key}
                                    autoComplete="username"
                                    error={errors.wordpressUsername?.message}
                                    onChange={(e) => field.onChange(e.target ? e.target.value : e)}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <Controller
                            name="wordpressAppPassword"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="app-password"
                                    name={field.name}
                                    value={field.value || ''}
                                    label={t('appPassword') || 'Application Password'}
                                    type="password"
                                    placeholder={configuredCredentials.hasWordpressAppPassword ? t('credentialConfigured') : "xxxx xxxx xxxx xxxx xxxx xxxx"}
                                    leftIcon={Key}
                                    autoComplete="current-password"
                                    error={errors.wordpressAppPassword?.message}
                                    onChange={(e) => field.onChange(e.target ? e.target.value : e)}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                />
                            )}
                        />
                        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                            {t('appPasswordDesc') || 'Generated from WordPress → Users → Profile → Application Passwords'}
                        </Text>
                    </div>
                </Space>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button
                    type="button"
                    onClick={onTestConnection}
                    disabled={testing}
                    variant="secondary"
                    icon={testing ? <Loader spin /> : <CheckCircle />}
                    loading={testing}
                >
                    {testing ? t('testing') : (t('checkAndSave') || 'בדוק חיבור ושמור')}
                </Button>
            </div>
        </Space>
    );
};

export default WooCommerceSettings;
