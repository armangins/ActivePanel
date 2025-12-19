import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Form, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../providers/AuthProvider';
import { authService } from '../api/auth.service';
import { signUpSchema, SignUpCredentials } from '../api/schemas';
import { checkRateLimit } from '@/utils/security'; // Need to ensure this exists or use similar logic

interface SignUpFormProps {
    onSuccess: () => void;
}

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
    const { login } = useAuth();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<SignUpCredentials>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });

    const onSubmit = async (data: SignUpCredentials) => {
        setError('');
        setIsLoading(true);

        try {
            // Rate limiting
            const rateLimitCheck = checkRateLimit('signup', 5, 15 * 60 * 1000);
            if (!rateLimitCheck.allowed) {
                setError('יותר מדי ניסיונות. אנא נסה שוב בעוד כמה דקות.');
                return;
            }

            // API Call
            const { user, accessToken } = await authService.register(data);

            // Success
            await login(user, accessToken);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'שגיאה בהרשמה. אנא נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {/* Name */}
                <Form.Item
                    label="שם מלא"
                    validateStatus={errors.name ? 'error' : ''}
                    help={errors.name?.message}
                >
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                prefix={<UserOutlined />}
                                placeholder="הכנס שם מלא"
                                size="large"
                                autoComplete="name"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    label="כתובת אימייל"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                prefix={<MailOutlined />}
                                placeholder="הכנס אימייל"
                                size="large"
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    label="סיסמה"
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input.Password
                                {...field}
                                prefix={<LockOutlined />}
                                placeholder="הכנס סיסמה"
                                size="large"
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                    label="אימות סיסמה"
                    validateStatus={errors.confirmPassword ? 'error' : ''}
                    help={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <Input.Password
                                {...field}
                                prefix={<LockOutlined />}
                                placeholder="אימות סיסמה"
                                size="large"
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        )}
                    />
                </Form.Item>

                {/* Submit Button */}
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLoading}
                    icon={isLoading ? <LoadingOutlined /> : null}
                    style={{ height: 48, fontSize: 16, fontWeight: 500, marginTop: 12 }}
                >
                    {isLoading ? 'נרשם...' : 'הירשם'}
                </Button>
            </Form>
        </div>
    );
};
