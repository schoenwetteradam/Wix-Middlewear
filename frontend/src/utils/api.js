import axios from 'axios';
import { createClient } from '@wix/sdk';
import { dashboard } from '@wix/dashboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Check if we're running in Wix environment
let isWixEnvironment = false;
if (typeof window !== 'undefined') {
  isWixEnvironment = !!(
    window.wixBiSession || 
    window.parent !== window || 
    window.location.search.includes('token=') ||
    window.location.hostname.includes('wix.com') ||
    window.location.hostname.includes('wixsite.com')
  );
}

// Helper function to get auth token from Wix SDK
async function getWixAuthToken() {
  if (!isWixEnvironment || !dashboard) {
    return null;
  }

  try {
    // Try multiple methods to get the auth token
    const auth = dashboard.auth();
    
    // Method 1: Try getAuthHeaders (if available)
    if (typeof auth.getAuthHeaders === 'function') {
      const headers = await auth.getAuthHeaders();
      if (headers) {
        if (typeof headers === 'string') {
          return headers.startsWith('Bearer ') ? headers : `Bearer ${headers}`;
        }
        if (headers.Authorization) {
          return headers.Authorization;
        }
        if (headers.authorization) {
          return headers.authorization;
        }
      }
    }
    
    // Method 2: Try getAuthToken (if available)
    if (typeof auth.getAuthToken === 'function') {
      const token = await auth.getAuthToken();
      if (token) {
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    }
    
    // Method 3: Try fetchWithAuth to extract token
    // This is a fallback - we'll use fetchWithAuth wrapper if available
    if (typeof dashboard.fetchWithAuth === 'function') {
      // fetchWithAuth is available, but we can't extract token from it
      // We'll need to use it directly for requests
      return 'FETCH_WITH_AUTH'; // Special marker
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get Wix auth token:', error.message);
    return null;
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  try {
    const authToken = await getWixAuthToken();
    
    if (authToken === 'FETCH_WITH_AUTH') {
      // If fetchWithAuth is available, we should use it instead of axios
      // For now, we'll proceed without auth and let the backend handle it
      console.warn('fetchWithAuth available but using axios - consider refactoring');
    } else if (authToken) {
      config.headers.Authorization = authToken;
    }
  } catch (error) {
    // Silently fail - the backend should handle unauthenticated requests
    console.warn('Failed to get auth token (non-critical):', error.message);
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log 400 errors for debugging
    if (error.response && error.response.status === 400) {
      console.error('API 400 Error:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        headers: error.config?.headers,
      });
    }
    return Promise.reject(error);
  }
);

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
