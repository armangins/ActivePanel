import { Typography, Space, Card, Button } from 'antd';
import {
    FileTextOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

export const HelpSettings = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleOpenDocumentation = () => {
        navigate('/settings/woocommerce-setup');
    };

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Documentation Link */}
            <Card style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
                <Space align="start">
                    <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div>
                        <Title level={4} style={{ color: '#0050b3', margin: 0 }}>
                            {t('fullDocumentation') || 'מדריך הגדרה מלא'}
                        </Title>
                        <Paragraph style={{ color: '#0050b3', marginBottom: 16 }}>
                            {t('documentationDescription') || 'לקבלת מדריך מפורט עם הוראות שלב אחר שלב, פתרון בעיות וטיפים לאבטחה, עיין במדריך המלא.'}
                        </Paragraph>
                        <Button
                            type="primary"
                            onClick={handleOpenDocumentation}
                            icon={<ExportOutlined />}
                        >
                            {t('openFullGuide') || 'פתח מדריך מלא'}
                        </Button>
                    </div>
                </Space>
            </Card>

            {/* Quick Start Guide */}
            <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <Title level={4} style={{ color: '#389e0d', margin: '0 0 16px 0' }}>
                    {t('howToGetAPICredentials') || 'איך לקבל פרטי API - מדריך מהיר'}
                </Title>
                <ol style={{ paddingLeft: 20, color: '#389e0d' }}>
                    <li>{t('apiStep1') || 'התחבר לפאנל הניהול של WooCommerce'}</li>
                    <li>{t('apiStep2') || 'נווט אל WooCommerce → הגדרות → מתקדם → REST API'}</li>
                    <li>{t('apiStep3') || 'לחץ על "הוסף מפתח" כדי ליצור מפתח API חדש'}</li>
                    <li>{t('apiStep4') || 'הגדר את התיאור והרשאות המשתמש (קריאה/כתיבה)'}</li>
                    <li>{t('apiStep5') || 'העתק את מפתח הצרכן וסוד הצרכן'}</li>
                    <li>{t('apiStep6') || 'הדבק אותם בשדות למעלה ושמור'}</li>
                </ol>
            </Card>

            {/* Troubleshooting */}
            <Card style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                <Title level={4} style={{ margin: '0 0 16px 0' }}>
                    {t('commonIssues') || 'בעיות נפוצות'}
                </Title>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: 12 }}>
                        <Text strong>{t('issueConnection') || 'חיבור נכשל?'}</Text>
                        <Text style={{ marginLeft: 8 }}>
                            {t('issueConnectionSolution') || 'ודא שהכתובת מתחילה ב-https:// ושהמפתחות הועתקו במלואם'}
                        </Text>
                    </li>
                    <li style={{ marginBottom: 12 }}>
                        <Text strong>{t('issuePermissions') || 'אין הרשאות?'}</Text>
                        <Text style={{ marginLeft: 8 }}>
                            {t('issuePermissionsSolution') || 'ודא שמפתח ה-API מוגדר להרשאות קריאה/כתיבה'}
                        </Text>
                    </li>
                    <li>
                        <Text strong>{t('issueImages') || 'תמונות לא עולות?'}</Text>
                        <Text style={{ marginLeft: 8 }}>
                            {t('issueImagesSolution') || 'ודא שהגדרת את שם המשתמש וסיסמת האפליקציה של WordPress'}
                        </Text>
                    </li>
                </ul>
            </Card>
        </Space>
    );
};
