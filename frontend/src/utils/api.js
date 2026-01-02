import axios from 'axios';
import { createClient } from '@wix/sdk';
import { dashboard } from '@wix/dashboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create Wix SDK client with error handling
// Only initialize if we're in a Wix environment
let wixClient = null;

// Check if we're running in Wix environment
const isWixEnvironment = typeof window !== 'undefined' && 
  (window.wixBiSession || window.parent !== window || window.location.search.includes('token='));

if (isWixEnvironment) {
  try {
    wixClient = createClient({
      auth: dashboard.auth(),
      host: dashboard.host(),
    });
  } catch (error) {
    console.warn('Failed to initialize Wix SDK client:', error);
    // Create a minimal client that won't break the app
    wixClient = {
      auth: {
        getAuthHeaders: async () => {
          console.warn('Wix SDK not fully initialized, auth headers unavailable');
          return null;
        },
      },
    };
  }
} else {
  // Not in Wix environment - create a stub client
  wixClient = {
    auth: {
      getAuthHeaders: async () => {
        return null;
      },
    },
  };
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor with better error handling
api.interceptors.request.use(async (config) => {
  try {
    // Only try to get auth token if we're in a Wix environment
    if (wixClient && wixClient.auth && typeof wixClient.auth.getAuthHeaders === 'function') {
      const token = await wixClient.auth.getAuthHeaders();
      if (token && token.Authorization) {
        config.headers.Authorization = token.Authorization;
      }
    }
  } catch (error) {
    // Silently fail - the backend should handle unauthenticated requests
    // This prevents errors from blocking API calls
    console.warn('Failed to get auth token (non-critical):', error.message);
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
