import axios from 'axios';

const API = axios.create({
  baseURL: 'https://pasovitecommerce.onrender.com/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me')
};

// Product APIs
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  getCategories: () => API.get('/products/filters/categories'),
  getSizes: () => API.get('/products/filters/sizes'),
  getPriceRange: () => API.get('/products/filters/price-range')
};

// Cart APIs
export const cartAPI = {
  add: (data) => API.post('/cart/add', data),
  get: () => API.get('/cart'),
  update: (data) => API.put('/cart/update', data),
  remove: (data) => API.delete('/cart/remove', { data }),
  clear: () => API.delete('/cart/clear')
};

// Order APIs
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getAll: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  getAllOrders: () => API.get('/orders/admin/all')
};

export default API;
