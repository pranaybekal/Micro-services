import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor (JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (debugging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getAddresses: () => api.get('/api/users/addresses'),
  addAddress: (data) => api.post('/api/users/addresses', data),
};

export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
};

export const cartAPI = {
  get: (userId) => api.get(`/api/cart/${userId}`),
  addItem: (userId, data) => api.post(`/api/cart/${userId}/items`, data),
  updateItem: (userId, productId, data) => api.put(`/api/cart/${userId}/items/${productId}`, data),
  removeItem: (userId, productId) => api.delete(`/api/cart/${userId}/items/${productId}`),
  clear: (userId) => api.delete(`/api/cart/${userId}`),
};

export const orderAPI = {
  create: (data) => api.post('/api/orders', data),
  getUserOrders: (userId) => api.get(`/api/orders/user/${userId}`),
  getById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, data) => api.put(`/api/orders/${id}/status`, data),
};

export const inventoryAPI = {
  getAll: () => api.get('/api/inventory'),
  getByProductId: (productId) => api.get(`/api/inventory/${productId}`),
  addProduct: (data) => api.post('/api/inventory/add-product', data),
  update: (productId, data) => api.put(`/api/inventory/${productId}`, data),
  getLowStock: () => api.get('/api/inventory/alerts/low-stock'),
};

export default api;
