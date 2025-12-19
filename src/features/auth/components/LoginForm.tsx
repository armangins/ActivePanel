import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Checkbox, Form, Alert } from 'antd';
import { MailOutlined, LockOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../providers/AuthProvider';
import { authService } from '../api/auth.service';
import { loginSchema, LoginCredentials } from '../api/schemas';
import { checkLoginRateLimit, recordFailedLoginAttempt, clearFailedLoginAttempts } from '@/utils/loginHelpers';

interface LoginFormProps {
    onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const { login } = useAuth();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        }
    });

    const onSubmit = async (data: LoginCredentials) => {
        setError('');
        setIsLoading(true);

        try {
            // Rate limiting
            const rateLimitCheck = checkLoginRateLimit(data.email);
            if (!rateLimitCheck.allowed) {
                setError(rateLimitCheck.error);
                return;
            }

            // API Call
            const { user, accessToken } = await authService.login(data);

            // Success
            clearFailedLoginAttempts(data.email);
            await login(user, accessToken);
            onSuccess();
        } catch (err: any) {
            recordFailedLoginAttempt(data.email);
            setError(err.message || 'שגיאה בהתחברות. אנא נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: 450 }}>
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginBottom: 24 }}
                />
            )}

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {/* Email */}
                <Form.Item
                    label="מייל" // Email
                    name="email"
                    htmlFor="email"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="email"
                                prefix={<MailOutlined />}
                                placeholder="info@gmail.com"
                                size="large"
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    label="סיסמא" // Password
                    name="password"
                    htmlFor="password"
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input.Password
                                {...field}
                                id="password"
                                prefix={<LockOutlined />}
                                placeholder="הזינו סיסמא"
                                size="large"
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Remember Me & Forgot Password */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field: { value, onChange, ...field } }) => (
                            <Checkbox
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                                {...field}
                            >
                                תזכרו אותי בבקשה
                            </Checkbox>
                        )}
                    />
                    <a href="#" style={{ fontSize: 14, color: '#1890ff', textDecoration: 'none' }}>
                        ? שחכתם סיסמא
                    </a>
                </div>

                {/* Submit Button */}
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLoading}
                    icon={isLoading ? <LoadingOutlined /> : null}
                    style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                >
                    {isLoading ? 'מאמתים אתכם, זה יקח רק עוד רגע...' : 'התחברות'}
                </Button>
            </Form>
        </div>
    );
};
