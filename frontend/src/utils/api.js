import axios from 'axios';
import { dashboard } from '@wix/dashboard';

const DEFAULT_API_BASE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

// Check if we're running in Wix environment
let isWixEnvironment = false;
if (typeof window !== 'undefined') {
  const host = window.location.hostname || '';
  isWixEnvironment = !!(
    window.wixBiSession ||
    window.location.search.includes('token=') ||
    host.includes('wix.com') ||
    host.includes('wixsite.com') ||
    host.includes('wixstudio.com')
  );
}

// Helper function to get auth token from Wix SDK
async function getWixAuthToken() {
  if (!isWixEnvironment || !dashboard || typeof dashboard.auth !== 'function') {
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

    return null;
  } catch (error) {
    // Some Wix environments throw internally; treat as no token
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

    if (authToken) {
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
  getAll: (params) => request('get', '/appointments', { params }),
  getByStaff: (staffId, params) => request('get', `/appointments/staff/${staffId}`, { params }),
  create: (data) => request('post', '/appointments', { data }),
  updateStatus: (id, status) => request('put', `/appointments/${id}/status`, { data: { status } }),
  cancel: (id) => request('delete', `/appointments/${id}`),
  getAvailability: (params) => request('get', '/appointments/availability', { params }),
};

export const eventsAPI = {
  getAll: (params) => request('get', '/events', { params }),
  create: (data) => request('post', '/events', { data }),
  update: (id, data) => request('put', `/events/${id}`, { data }),
  delete: (id) => request('delete', `/events/${id}`),
  getRegistrations: (id) => request('get', `/events/${id}/registrations`),
};

export const staffAPI = {
  getAll: () => request('get', '/staff'),
  getAppointments: (staffId, params) => request('get', `/staff/${staffId}/appointments`, { params }),
  getServices: () => request('get', '/staff/services'),
};

export const dashboardAPI = {
  getKPIs: (params) => request('get', '/dashboard/kpis', { params }),
  getUpcoming: (params) => request('get', '/dashboard/upcoming', { params }),
  getStaffOverview: (params) => request('get', '/dashboard/staff-overview', { params }),
};

export const notificationsAPI = {
  sendReminder: (bookingId) => request('post', '/notifications/send-reminder', { data: { bookingId } }),
  testEmail: (data) => request('post', '/notifications/test-email', { data }),
};

export default api;

async function request(method, url, options = {}) {
  const { params, data } = options;

  if (isWixEnvironment && typeof dashboard?.fetchWithAuth === 'function') {
    const search = params ? `?${new URLSearchParams(params).toString()}` : '';
    const fullUrl = `${API_BASE_URL}${url}${search}`;
    const response = await dashboard.fetchWithAuth(fullUrl, {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      const error = new Error(responseData?.error || response.statusText);
      error.response = { status: response.status, data: responseData };
      throw error;
    }

    return { data: responseData };
  }

  return api.request({
    method,
    url,
    params,
    data,
  });
}
