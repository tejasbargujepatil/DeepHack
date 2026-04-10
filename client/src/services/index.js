import api from './api';

export const authService = {
  register:      (data) => api.post('/auth/register', data),
  registerAdmin: (data) => api.post('/auth/register-admin', data),
  verifyEmail:   (data) => api.post('/auth/verify-email', data),
  login:         (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
};


export const productService = {
  getAll:        (params) => api.get('/products', { params }),
  getMyProducts: (params) => api.get('/products/admin/my', { params }),
  getOne:        (id)     => api.get(`/products/${id}`),
  create:        (data)   => api.post('/products', data),
  update:        (id, data) => api.put(`/products/${id}`, data),
  delete:        (id)     => api.delete(`/products/${id}`),
};


export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateMe: (data) => api.patch('/users/update-me', data),
  updatePassword: (data) => api.patch('/users/update-password', data),
  // Addresses
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  // Cart
  getCart: () => api.get('/users/cart'),
  addToCart: (data) => api.post('/users/cart', data),
  removeFromCart: (productId) => api.delete(`/users/cart/${productId}`),
  // Wishlist
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (data) => api.post('/users/wishlist', data),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  // SUPER_ADMIN
  getAllUsers:   (params) => api.get('/users', { params }),
  getAllAdmins:  (params) => api.get('/users/admins', { params }),
  toggleBlock:  (id) => api.patch(`/users/${id}/block`),
  updateRole:   (id, data) => api.patch(`/users/${id}/role`, data),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  // Admin
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/create-razorpay-order', data),
  verify: (data) => api.post('/payments/verify', data),
  placeCOD: (data) => api.post('/payments/cod', data),
};

export const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  getSalesReport: (params) => api.get('/reports/sales-report', { params }),
  exportSales: () => api.get('/reports/export-sales', { responseType: 'blob' }),
  exportPDF:   () => api.get('/reports/export-pdf',   { responseType: 'blob' }),
};

export const aiService = {
  chat: (query, history = []) => api.post('/ai/chat', { query, history }),
  getRecommendations: () => api.get('/ai/recommendations'),
};
