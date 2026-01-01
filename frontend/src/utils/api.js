import axios from 'axios';
import { createClient } from '@wix/sdk';
import { dashboard } from '@wix/dashboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create Wix SDK client
export const wixClient = createClient({
  auth: dashboard.auth(),
  host: dashboard.host(),
});

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  try {
    // Get auth token from Wix
    const token = await wixClient.auth.getAuthHeaders();
    if (token) {
      config.headers.Authorization = token.Authorization;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

// API methods
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getByStaff: (staffId, params) => api.get(`/appointments/staff/${staffId}`, { params }),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getAvailability: (params) => api.get('/appointments/availability', { params }),
};

export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
};

export const staffAPI = {
  getAll: () => api.get('/staff'),
  getAppointments: (staffId, params) => api.get(`/staff/${staffId}/appointments`, { params }),
  getServices: () => api.get('/staff/services'),
};

export const dashboardAPI = {
  getKPIs: (params) => api.get('/dashboard/kpis', { params }),
  getUpcoming: (params) => api.get('/dashboard/upcoming', { params }),
  getStaffOverview: (params) => api.get('/dashboard/staff-overview', { params }),
};

export const notificationsAPI = {
  sendReminder: (bookingId) => api.post('/notifications/send-reminder', { bookingId }),
  testEmail: (data) => api.post('/notifications/test-email', data),
};

export default api;
