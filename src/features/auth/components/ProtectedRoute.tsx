import { useState, useEffect, useRef, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAuth();
    const [pendingAuthCheck, setPendingAuthCheck] = useState(false);
    const hasCheckedPendingAuth = useRef(false);

    useEffect(() => {
        if (!loading && !isAuthenticated && !hasCheckedPendingAuth.current) {
            hasCheckedPendingAuth.current = true;
            setPendingAuthCheck(true);

            const timeoutId = setTimeout(() => {
                setPendingAuthCheck(false);
                hasCheckedPendingAuth.current = false;
            }, 100);

            return () => clearTimeout(timeoutId);
        } else if (isAuthenticated) {
            hasCheckedPendingAuth.current = false;
            setPendingAuthCheck(false);
        }
    }, [loading, isAuthenticated]);

    if (loading || pendingAuthCheck) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#6b7280' }}>טוען...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
