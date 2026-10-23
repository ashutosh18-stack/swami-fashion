// Swami Fashion - Unified API Client

const BASE_URL = ''; // Proxied via Vite to http://localhost:5000 in dev and relative in prod

async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // If payload is FormData, do not set Content-Type header (browser sets boundary)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Crucial for HTTP-only admin cookies
    headers: defaultHeaders
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : 'API Request Failed');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Public APIs
  getSettings: () => request('/api/public/settings'),
  getBanners: () => request('/api/public/banners'),
  getCategories: () => request('/api/public/categories'),
  getCollections: () => request('/api/public/collections'),
  getCollection: (slug) => request(`/api/public/collections/${slug}`),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/api/public/products?${query.toString()}`);
  },
  getProduct: (slug) => request(`/api/public/products/${slug}`),
  submitContact: (data) => request('/api/public/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Admin Authentication
  verifyPassword: (username, password) =>
    request('/api/admin/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  verifyPin: (tempToken, pin) =>
    request('/api/admin/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ tempToken, pin })
    }),

  getSessionStatus: (passive = false) =>
    request('/api/admin/auth/session-status', {
      method: 'GET',
      headers: passive ? { 'X-Passive-Check': 'true' } : {}
    }),

  logout: () => request('/api/admin/auth/logout', { method: 'POST' }),

  changePassword: (data) =>
    request('/api/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  changePin: (data) =>
    request('/api/admin/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Dashboard & Operations
  getDashboardStats: () => request('/api/admin/dashboard/stats'),
  getAuditLogs: () => request('/api/admin/dashboard/audit-logs'),

  // Admin Products
  adminGetProducts: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.append(k, v);
    });
    return request(`/api/admin/products?${q.toString()}`);
  },
  adminGetProduct: (id) => request(`/api/admin/products/${id}`),
  adminCreateProduct: (data) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  adminToggleProductStatus: (id) => request(`/api/admin/products/${id}/toggle-status`, { method: 'PATCH' }),

  // Admin Categories
  adminGetCategories: () => request('/api/admin/categories'),
  adminCreateCategory: (data) => request('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCategory: (id, data) => request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCategory: (id) => request(`/api/admin/categories/${id}`, { method: 'DELETE' }),

  // Admin Collections
  adminGetCollections: () => request('/api/admin/collections'),
  adminCreateCollection: (data) => request('/api/admin/collections', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCollection: (id, data) => request(`/api/admin/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCollection: (id) => request(`/api/admin/collections/${id}`, { method: 'DELETE' }),

  // Admin Banners
  adminGetBanners: () => request('/api/admin/banners'),
  adminCreateBanner: (data) => request('/api/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateBanner: (id, data) => request(`/api/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteBanner: (id) => request(`/api/admin/banners/${id}`, { method: 'DELETE' }),

  // Admin Settings & Theme
  adminGetSettings: () => request('/api/admin/settings'),
  adminUpdateSettings: (data) => request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  adminAnalyzeThemeFromLogo: (logoPath) =>
    request('/api/admin/settings/analyze-theme', {
      method: 'POST',
      body: JSON.stringify({ logoPath })
    }),

  // Uploads
  uploadImages: (formData) =>
    request('/api/admin/upload', {
      method: 'POST',
      body: formData
    }),

  // Sub-Admin Management (Main Admin Only)
  adminGetSubAdmins: () => request('/api/admin/sub-admins'),
  adminCreateSubAdmin: (data) => request('/api/admin/sub-admins', { method: 'POST', body: JSON.stringify(data) }),
  adminToggleSubAdminStatus: (id) => request(`/api/admin/sub-admins/${id}/toggle-status`, { method: 'PATCH' }),
  adminDeleteSubAdmin: (id) => request(`/api/admin/sub-admins/${id}`, { method: 'DELETE' })
};
