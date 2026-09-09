import axios from 'axios';

const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isDev ? 'http://127.0.0.1:8000' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('photoshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/gallery/') && !error.config.url?.includes('/auth/login')) {
      // Clear token only for user routes, not gallery customer PIN errors
      localStorage.removeItem('photoshare_token');
      localStorage.removeItem('photoshare_user');
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/team')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Backend base URL (used to resolve local /uploads paths)
export const BACKEND_URL =
  import.meta.env.VITE_API_URL || (isDev ? 'http://127.0.0.1:8000' : '');

/**
 * Resolves a photo's storage_location to a fully qualified URL.
 * - External URLs (http/https) are returned as-is.
 * - Relative paths like /uploads/... are prefixed with the backend origin.
 */
export function getPhotoUrl(storageLocation) {
  if (!storageLocation) return '';
  if (storageLocation.startsWith('http://') || storageLocation.startsWith('https://')) {
    return storageLocation;
  }
  return `${BACKEND_URL}${storageLocation}`;
}
