import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Orders from './components/Orders/Orders';
import Customers from './components/Customers/Customers';
import Coupons from './components/Coupons/Coupons';
import Calculator from './components/Calculator/Calculator';
import Settings from './components/Settings/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex h-screen bg-gray-50">
                      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                        <main className="flex-1 overflow-y-auto p-6">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/coupons" element={<Coupons />} />
                            <Route path="/calculator" element={<Calculator />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

