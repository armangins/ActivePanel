import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { LoadingState } from './components/ui';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileBottomNav from './components/Layout/MobileBottomNav';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Auth/Login'));
const SignUp = lazy(() => import('./components/Auth/SignUp'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Products = lazy(() => import('./components/Products/Products'));
const Orders = lazy(() => import('./components/Orders/Orders'));
const Customers = lazy(() => import('./components/Customers/Customers'));
const Coupons = lazy(() => import('./components/Coupons/Coupons'));
const Categories = lazy(() => import('./components/Categories/Categories'));
const Calculator = lazy(() => import('./components/Calculator/Calculator'));
const Imports = lazy(() => import('./components/Imports/Imports'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const AddProductView = lazy(() => import('./components/Products/AddProductView'));
const ChatAssistant = lazy(() => import('./components/AI/ChatAssistant'));
const EditVariationView = lazy(() => import('./components/Products/EditVariationView'));

function App() {
  // Sidebar closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Handle window resize to update sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <>
                        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
                          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                          <div className={`flex-1 flex flex-col overflow-hidden min-w-0 w-full transition-all duration-300 ${sidebarOpen ? 'lg:mr-0' : 'mr-0'}`}>
                            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 main-content-padding">
                              <Suspense fallback={<LoadingState />}>
                                <Routes>
                                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                  <Route path="/dashboard" element={<Dashboard />} />
                                  <Route path="/products" element={<Products />} />
                                  <Route path="/orders" element={<Orders />} />
                                  <Route path="/customers" element={<Customers />} />
                                  <Route path="/coupons" element={<Coupons />} />
                                  <Route path="/categories" element={<Categories />} />
                                  <Route path="/calculator" element={<Calculator />} />
                                  <Route path="/imports" element={<Imports />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/products/add" element={<AddProductView />} />
                                  <Route path="/products/edit/:id" element={<AddProductView />} />
                                  <Route path="/products/:id/variations/:variationId/edit" element={<EditVariationView />} />
                                </Routes>
                              </Suspense>
                            </main>
                          </div>
                        </div>
                        {/* Mobile Bottom Navigation */}
                        <MobileBottomNav />
                        {/* Global AI Chat Assistant - Available on all pages */}
                        <Suspense fallback={null}>
                          <ChatAssistant />
                        </Suspense>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

