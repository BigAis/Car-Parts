import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
};

// Parts endpoints
export const parts = {
  getAll: (params) => api.get('/parts', { params }),
  getById: (id) => api.get(`/parts/${id}`),
  search: (params) => api.get('/search', { params: { type: 'parts', ...params } }),
  getCompatible: (params) => api.get('/parts/compatible', { params }),
};

// Categories endpoints
export const categories = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// Car makes and models
export const cars = {
  getAllMakes: () => api.get('/cars/makes'),
  getModelsByMake: (makeId) => api.get(`/cars/models/${makeId}`),
};

// Orders endpoints
export const orders = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
};

// Inventory endpoints (for business users)
export const inventory = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  getByBusiness: (businessId) => api.get(`/inventory/business/${businessId}`),
  create: (inventoryData) => api.post('/inventory', inventoryData),
  update: (id, inventoryData) => api.put(`/inventory/${id}`, inventoryData),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Wishlist endpoints
export const wishlist = {
  getAll: () => api.get('/wishlist'),
  add: (inventoryId) => api.post('/wishlist', { inventory_id: inventoryId }),
  remove: (id) => api.delete(`/wishlist/${id}`),
};

export default api;