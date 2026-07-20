import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data: any) => api.put('/api/auth/me/profile', data),
  updateLanguage: (lang: string) => api.put(`/api/auth/me/language?language=${lang}`),
};

// Schemes
export const schemesApi = {
  computeMatches: () => api.post('/api/schemes/compute-matches'),
  getMatches: () => api.get('/api/schemes/my-matches'),
  getBenefitsCalc: () => api.get('/api/schemes/benefits-calculator'),
  getDashboardStats: () => api.get('/api/schemes/dashboard-stats'),
  search: (q: string, state?: string) => api.get('/api/schemes/search', { params: { q, state } }),
  list: (skip = 0, limit = 20) => api.get('/api/schemes/list', { params: { skip, limit } }),
  getById: (id: string) => api.get(`/api/schemes/${id}`),
  save: (id: string) => api.post(`/api/schemes/${id}/save`),
  unsave: (id: string) => api.delete(`/api/schemes/${id}/save`),
  getSaved: () => api.get('/api/schemes/user/saved'),
  chat: (message: string, language = 'en') => api.post('/api/schemes/chat', { message, language }),
  getNotifications: () => api.get('/api/schemes/user/notifications'),
  markNotifRead: (id: string) => api.put(`/api/schemes/user/notifications/${id}/read`),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  getDepartments: () => api.get('/api/admin/departments'),
  createDepartment: (data: any) => api.post('/api/admin/departments', data),
  getSchemes: () => api.get('/api/admin/schemes'),
  createScheme: (data: any) => api.post('/api/admin/schemes', data),
  updateScheme: (id: string, data: any) => api.put(`/api/admin/schemes/${id}`, data),
  deleteScheme: (id: string) => api.delete(`/api/admin/schemes/${id}`),
};

export default api;
