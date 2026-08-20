/**
 * Shohnaat Logistics — Resilient Frontend API Client
 * Automatic auth header injection, error normalization, and fallback handling
 */

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

interface ApiResponse<T = any> {
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

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('shohnaat_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
      });

      const data = await res.json().catch(() => ({
        success: false,
        message: `HTTP Error ${res.status}: ${res.statusText}`,
      }));

      if (!res.ok) {
        // If 401 Unauthorized, handle token expiration gracefully
        if (res.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
          console.warn('Session expired. Redirecting to login...');
        }
        return {
          success: false,
          message: data.message || `Request failed with status ${res.status}`,
          error_code: data.error_code,
          data: data.data,
        };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network connection failed. Please check your internet or server status.',
        error_code: 'NETWORK_ERROR',
      };
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
export default api;
