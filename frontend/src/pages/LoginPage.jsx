import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/helpers';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
    
    // Display message if redirected from another page
    if (location.state?.message) {
      setMessage(location.state.message);
      
      // Prefill email if provided (e.g., from registration)
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, let's use a simple credential check
      // In a real app, this would be an API call to your backend
      if (formData.email === 'demo@example.com' && formData.password === 'password') {
        // Create a mock user and token
        const mockUser = {
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          user_type: 'customer',
          first_name: 'Demo',
          last_name: 'User',
          phone: '555-123-4567'
        };
        
        // Store in localStorage
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Redirect to dashboard or the page they were trying to access
        const redirectTo = location.state?.from || '/dashboard';
        navigate(redirectTo);
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="auth-form-container">
          <h1>Log In to Your Account</h1>
          
          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}
          
          {loginError && (
            <div className="alert alert-error">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
            
            <div className="form-group">
              <button 
                type="submit" 
                className="btn btn-primary full-width"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="auth-separator">
            <span>Don't have an account?</span>
          </div>
          
          <div className="auth-links">
            <Link to="/register" className="btn btn-outline-primary full-width">
              Register Now
            </Link>
          </div>
          
          <div className="auth-switch">
            <div className="business-link">
              <p>Are you a Car Parts Supplier?</p>
              <Link to="/register?type=business">Register your Business</Link>
            </div>
          </div>
          
          {/* Demo credentials info - remove in production */}
          <div className="demo-credentials">
            <p>Demo credentials: demo@example.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;