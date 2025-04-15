import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/helpers';

/**
 * ProtectedRoute - A component that protects routes requiring authentication
 * 
 * @param {Object} props 
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {Array<string>} [props.allowedUserTypes] - Optional array of allowed user types (e.g. ['business'])
 * @param {string} [props.redirectTo] - Path to redirect to if unauthorized (default: /login)
 */
const ProtectedRoute = ({ children, allowedUserTypes, redirectTo = '/login' }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the user is authenticated
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }
    
    // If there are user type restrictions, check user type
    if (allowedUserTypes && allowedUserTypes.length > 0) {
      const currentUser = getCurrentUser();
      
      if (!currentUser || !allowedUserTypes.includes(currentUser.user_type)) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }
    }
    
    // User is authorized
    setIsAuthorized(true);
    setIsChecking(false);
  }, [allowedUserTypes]);

  if (isChecking) {
    // Show loading while checking authorization
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to login if not authorized, preserving the intended destination
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: allowedUserTypes 
            ? "You don't have permission to access this page" 
            : "Please log in to continue" 
        }} 
        replace 
      />
    );
  }

  // Render children if authorized
  return children;
};

export default ProtectedRoute;