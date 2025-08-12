import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Axios instance con baseURL
const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
  try { window.dispatchEvent(new Event('auth-changed')); } catch {}
};

export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_data');
  try { window.dispatchEvent(new Event('auth-changed')); } catch {}
};

const redirectToLogin = () => {
  const current = window.location.pathname + window.location.search;
  // Preservar destino para volver luego del login
  const params = new URLSearchParams({ next: current });
  window.location.href = `/login?${params.toString()}`;
};

// Interceptor de request: agrega Authorization si hay token
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

// Interceptor de response: intenta refresh en 401 y reintenta
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (originalRequest?.headers?.['x-skip-refresh'] === 'true') {
        // Peticiones que explícitamente no deben refrescar
        clearAuth();
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest._retry = true;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = getRefreshToken();
        if (!refresh) {
          clearAuth();
          redirectToLogin();
          processQueue(new Error('No refresh token'));
          return Promise.reject(error);
        }

        const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh }, { headers: { 'Content-Type': 'application/json' } });
        const newAccess = res.data?.access;
        if (!newAccess) throw new Error('No access in refresh response');

        saveTokens({ access: newAccess });
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return http(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        clearAuth();
        redirectToLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
export { http };

