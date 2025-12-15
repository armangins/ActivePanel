import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products/Products';
import AddProductView from './components/Products/AddProductView';
import Orders from './components/Orders/Orders';
import Customers from './components/Customers/Customers';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import OAuthCallback from './components/Auth/OAuthCallback';
import ProtectedRoute from './components/Auth/ProtectedRoute';

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
      <Route path="/login" element={<Login />} />
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
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/add" element={<AddProductView />} />
                    <Route path="/products/edit/:id" element={<AddProductView />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
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
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </Router>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

