import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/* ─────────────────────────────────────────────────────────────
 *  Toast notification system (lightweight, no external deps)
 * ───────────────────────────────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;
let listeners: ToastListener[] = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function subscribeToasts(listener: ToastListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function showToast(type: ToastType, message: string, duration = 4000) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const toast: Toast = { id, type, message, duration };
  toasts = [...toasts, toast];
  notify();
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

/* ─────────────────────────────────────────────────────────────
 *  User-friendly error messages
 * ───────────────────────────────────────────────────────────── */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please sign in again.',
  403: 'You don\'t have permission for this action.',
  404: 'Resource not found.',
  408: 'Request timed out. Please try again.',
  409: 'Conflict — this resource already exists.',
  422: 'Validation error. Please check the form fields.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Retrying...',
  503: 'Service is under maintenance. Please try again later.',
};

function getErrorMessage(error: AxiosError<{ message?: string }>): string {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) {
    // Clear expired token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shohnaat_token');
      localStorage.removeItem('shohnaat_user');
    }
    return serverMessage || ERROR_MESSAGES[401];
  }

  if (status && ERROR_MESSAGES[status]) {
    return serverMessage || ERROR_MESSAGES[status];
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  return serverMessage || `Something went wrong (${status || 'unknown'}). Please try again.`;
}

/* ─────────────────────────────────────────────────────────────
 *  Axios instance with interceptors
 * ───────────────────────────────────────────────────────────── */
function getApiBaseUrl(): string {
  // Priority 1: Explicit env var (set at build/deploy time)
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // Priority 2: Auto-detect based on current domain
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Live production domain → use live API
    if (host.includes('shohnaat.rahimbadsa.me')) return 'https://api-shohnaat.rahimbadsa.me';
    // Localhost / LAN IP → use local backend
    return 'http://localhost:5001';
  }

  // Server-side fallback
  return 'http://localhost:5001';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('shohnaat_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors, show toasts
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);

    // Don't show toast for login errors (handled locally)
    const url = error.config?.url || '';
    if (!url.includes('/auth/login')) {
      if (status === 401) {
        showToast('warning', message);
        // Redirect to login after a short delay
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      } else if (status && status >= 500) {
        showToast('error', message);
      } else if (status === 429) {
        showToast('warning', message);
      }
    }

    return Promise.reject(error);
  },
);

/* ─────────────────────────────────────────────────────────────
 *  Typed API helpers
 * ───────────────────────────────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const res = await api.get<ApiResponse<T>>(endpoint);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: getErrorMessage(axiosErr),
      error_code: axiosErr.code,
    };
  }
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await api.post<ApiResponse<T>>(endpoint, body);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: getErrorMessage(axiosErr),
      error_code: axiosErr.code,
    };
  }
}

export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await api.patch<ApiResponse<T>>(endpoint, body);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: getErrorMessage(axiosErr),
      error_code: axiosErr.code,
    };
  }
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const res = await api.delete<ApiResponse<T>>(endpoint);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: getErrorMessage(axiosErr),
      error_code: axiosErr.code,
    };
  }
}

export { api };
export default api;
