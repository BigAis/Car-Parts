import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PartDetailsPage from './pages/PartDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, getCurrentUser } from './utils/helpers';
import './styles/main.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check auth state on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      
      if (authStatus) {
        setUser(getCurrentUser());
      } else {
        setUser(null);
      }
    };
    
    // Check on component mount
    checkAuth();
    
    // Listen for localStorage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/part/:id" element={<PartDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/category/:categoryId" element={<SearchPage />} />
          
          {/* Protected routes for all authenticated users */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/order-confirmation/:orderId" 
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Dashboard activeTab="profile" />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Dashboard activeTab="orders" />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Dashboard activeTab="wishlist" />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Dashboard activeTab="settings" />
              </ProtectedRoute>
            }
          />
          
          {/* Business user routes */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedUserTypes={['business']}>
                <Dashboard activeTab="inventory" />
              </ProtectedRoute>
            }
          />
          
          {/* 404 route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;