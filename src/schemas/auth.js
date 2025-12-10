import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'כתובת אימייל לא תקינה' }),
    password: z.string().min(1, { message: 'אנא הכנס סיסמה' }),
});

export const registerSchema = z.object({
    email: z.string().email({ message: 'כתובת אימייל לא תקינה' }),
    password: z.string().min(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }),
    confirmPassword: z.string(),
    name: z.string().min(2, { message: 'שם מלא חייב להכיל לפחות 2 תווים' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
});
