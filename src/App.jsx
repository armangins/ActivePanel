import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth, LoginPage, SignUpPage, OAuthCallback, ProtectedRoute } from '@/features/auth';
import { SettingsProvider } from '@/features/settings';
import { MessageProvider } from './contexts/MessageContext';
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// Lazy load route components for code-splitting
const Dashboard = lazy(() => import('@/features/dashboard'));
const Products = lazy(() => import('@/features/products'));
const ProductForm = lazy(() => import('@/features/products').then(module => ({ default: module.ProductForm })));
const Orders = lazy(() => import('@/features/orders'));
const Customers = lazy(() => import('@/features/customers'));
const Coupons = lazy(() => import('@/features/coupons'));
const Categories = lazy(() => import('@/features/categories'));
const Attributes = lazy(() => import('@/features/attributes/pages/AttributesPage'));
const Settings = lazy(() => import('@/features/settings'));
const AttributesPage = lazy(() => import('@/features/attributes'));

const { Content } = Layout;

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isRTL } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Show loading state while checking authentication
  if (loading) {
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
          <p style={{ marginTop: '16px', color: '#6b7280' }}>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - no layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Protected routes - with layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }} dir={isRTL ? 'rtl' : 'ltr'}>
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onCollapseChange={setIsCollapsed}
                isCollapsed={isCollapsed}
              />
              <Layout>
                <Header
                  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
                  isCollapsed={isCollapsed}
                />
                <Content style={{ margin: isMobile ? '12px 8px' : '24px 16px', padding: isMobile ? 6 : 24, minHeight: 280, background: '#fff', borderRadius: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Suspense fallback={<div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/add" element={<ProductForm />} />
                      <Route path="/products/edit/:id" element={<ProductForm />} />
                      <Route path="/products/attributes" element={<AttributesPage />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/coupons" element={<Coupons />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Suspense>
                </Content>
              </Layout>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
            <MessageProvider>
              <SocketProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AppContent />
                </Router>
              </SocketProvider>
            </MessageProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

