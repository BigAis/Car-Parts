import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/helpers';

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultUserType = queryParams.get('type') === 'business' ? 'business' : 'customer';
  
  const [formData, setFormData] = useState({
    user_type: defaultUserType,
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    
    // Business-specific fields
    business_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    tax_id: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showBusinessFields, setShowBusinessFields] = useState(defaultUserType === 'business');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  useEffect(() => {
    // Update URL when user type changes
    if (formData.user_type === 'business') {
      navigate('/register?type=business', { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  }, [formData.user_type, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update user_type and show/hide business fields
    if (name === 'user_type') {
      setShowBusinessFields(value === 'business');
    }
    
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
    
    // Common validations
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Business-specific validations
    if (formData.user_type === 'business') {
      if (!formData.business_name) {
        newErrors.business_name = 'Business name is required';
      }
      
      if (!formData.address) {
        newErrors.address = 'Address is required';
      }
      
      if (!formData.city) {
        newErrors.city = 'City is required';
      }
      
      if (!formData.postal_code) {
        newErrors.postal_code = 'Postal code is required';
      }
      
      if (!formData.country) {
        newErrors.country = 'Country is required';
      }
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
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
    setRegisterError('');
    
    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be an API call to your backend
      
      // Registration successful, navigate to login
      navigate('/login', { 
        state: { 
          message: 'Registration successful! You can now log in.',
          email: formData.email
        } 
      });
    } catch (error) {
      setRegisterError('Registration failed. Please try again later.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="container">
        <div className="auth-form-container">
          <h1>Create an Account</h1>
          
          {registerError && (
            <div className="alert alert-error">
              {registerError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group user-type-toggle">
              <label>Account Type</label>
              <div className="toggle-buttons">
                <button
                  type="button"
                  className={`toggle-button ${formData.user_type === 'customer' ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'user_type', value: 'customer' } })}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`toggle-button ${formData.user_type === 'business' ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'user_type', value: 'business' } })}
                >
                  Business
                </button>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={errors.first_name ? 'error' : ''}
                />
                {errors.first_name && <div className="error-message">{errors.first_name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={errors.last_name ? 'error' : ''}
                />
                {errors.last_name && <div className="error-message">{errors.last_name}</div>}
              </div>
            </div>
            
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
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="form-row">
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
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={errors.confirm_password ? 'error' : ''}
                />
                {errors.confirm_password && <div className="error-message">{errors.confirm_password}</div>}
              </div>
            </div>
            
            {/* Business-specific fields */}
            {showBusinessFields && (
              <div className="business-fields">
                <h3>Business Information</h3>
                
                <div className="form-group">
                  <label htmlFor="business_name">Business Name</label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    className={errors.business_name ? 'error' : ''}
                  />
                  {errors.business_name && <div className="error-message">{errors.business_name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <div className="error-message">{errors.address}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <div className="error-message">{errors.city}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="postal_code">Postal Code</label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className={errors.postal_code ? 'error' : ''}
                    />
                    {errors.postal_code && <div className="error-message">{errors.postal_code}</div>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={errors.country ? 'error' : ''}
                    />
                    {errors.country && <div className="error-message">{errors.country}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tax_id">Tax ID (Optional)</label>
                    <input
                      type="text"
                      id="tax_id"
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      className={errors.tax_id ? 'error' : ''}
                    />
                    {errors.tax_id && <div className="error-message">{errors.tax_id}</div>}
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-group terms">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                />
                <span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link></span>
              </label>
              {errors.terms && <div className="error-message">{errors.terms}</div>}
            </div>
            
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="auth-separator">
            <span>Already have an account?</span>
          </div>
          
          <div className="auth-links">
            <Link to="/login" className="btn btn-outline-primary full-width">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;