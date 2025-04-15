/**
 * Helper utility functions for the application
 */

// Format price with 2 decimal places and currency symbol
export const formatPrice = (price, currency = '$') => {
  if (price === null || price === undefined) return 'N/A';
  return `${currency}${parseFloat(price).toFixed(2)}`;
};

// Format date in local format
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Generate slug from text
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/&/g, '-and-')     // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')   // Remove all non-word characters
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

// Get first letter of each word for initials
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part ? part[0].toUpperCase() : '')
    .join('')
    .slice(0, 2); // Get at most 2 initials
};

// Capitalize first letter of each word
export const capitalize = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Format a part condition for display
export const formatCondition = (condition) => {
  if (!condition) return '';
  return capitalize(condition);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Format order status for display with color
export const getOrderStatusData = (status) => {
  const statusMap = {
    'pending': { label: 'Pending', color: '#f0ad4e' },
    'processing': { label: 'Processing', color: '#5bc0de' },
    'shipped': { label: 'Shipped', color: '#5cb85c' },
    'delivered': { label: 'Delivered', color: '#0275d8' },
    'cancelled': { label: 'Cancelled', color: '#d9534f' }
  };
  
  return statusMap[status] || { label: capitalize(status), color: '#777' };
};

// Validate email format
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Validate password strength
export const isStrongPassword = (password) => {
  // At least 6 characters, containing at least one number
  return password.length >= 6 && /\d/.test(password);
};

// Generate array of years (for vehicle compatibility)
export const getYearRange = (startYear = 1980, endYear = new Date().getFullYear()) => {
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};