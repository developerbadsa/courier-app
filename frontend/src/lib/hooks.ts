'use client';

import { useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, showToast, type ApiResponse } from './api';

/* ─────────────────────────────────────────────────────────────
 *  Generic query hook — wraps apiGet with React Query
 * ───────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApiQuery<T = any>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ApiResponse<T>>({
    queryKey: key,
    queryFn: () => apiGet<T>(endpoint),
    ...options,
  });
}

/* ─────────────────────────────────────────────────────────────
 *  Generic mutation hooks — wraps apiPost/Patch/Delete
 * ───────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApiPost<TBody = any, TResult = any>(
  endpoint: string,
  options?: {
    successMessage?: string;
    invalidateKeys?: string[][];
    onSuccess?: (data: ApiResponse<TResult>, variables: TBody) => void;
    onError?: (error: Error) => void;
  },
) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKeys, onSuccess, onError } = options || {};

  return useMutation<ApiResponse<TResult>, Error, TBody>({
    mutationFn: (body) => apiPost<TResult>(endpoint, body),
    onSuccess: (data, variables) => {
      if (successMessage) showToast('success', successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      onSuccess?.(data, variables);
    },
    onError: (error) => {
      const msg = error.message || 'Operation failed. Please try again.';
      if (!msg.includes('Session expired')) {
        showToast('error', msg);
      }
      onError?.(error);
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApiPatch<TBody = any, TResult = any>(
  endpoint: string,
  options?: {
    successMessage?: string;
    invalidateKeys?: string[][];
    onSuccess?: (data: ApiResponse<TResult>, variables: TBody) => void;
    onError?: (error: Error) => void;
  },
) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKeys, onSuccess, onError } = options || {};

  return useMutation<ApiResponse<TResult>, Error, TBody>({
    mutationFn: (body) => apiPatch<TResult>(endpoint, body),
    onSuccess: (data, variables) => {
      if (successMessage) showToast('success', successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      onSuccess?.(data, variables);
    },
    onError: (error) => {
      const msg = error.message || 'Update failed. Please try again.';
      if (!msg.includes('Session expired')) {
        showToast('error', msg);
      }
      onError?.(error);
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useApiDelete<TResult = any>(
  endpoint: string,
  options?: {
    successMessage?: string;
    invalidateKeys?: string[][];
    onSuccess?: (data: ApiResponse<TResult>) => void;
    onError?: (error: Error) => void;
  },
) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKeys, onSuccess, onError } = options || {};

  return useMutation<ApiResponse<TResult>, Error, void>({
    mutationFn: () => apiDelete<TResult>(endpoint),
    onSuccess: (data) => {
      if (successMessage) showToast('success', successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      const msg = error.message || 'Delete failed. Please try again.';
      if (!msg.includes('Session expired')) {
        showToast('error', msg);
      }
      onError?.(error);
    },
  });
}

/* ─────────────────────────────────────────────────────────────
 *  Auth hook
 * ───────────────────────────────────────────────────────────── */
interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export function useAuth() {
  const login = useApiPost<
    { email: string; password: string },
    { accessToken: string; user: AuthUser }
  >('/api/v1/auth/login', {
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('shohnaat_token', data.data.accessToken);
        localStorage.setItem('shohnaat_user', JSON.stringify(data.data.user));
      }
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem('shohnaat_token');
    localStorage.removeItem('shohnaat_user');
    window.location.href = '/login';
  }, []);

  const getUser = useCallback((): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('shohnaat_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('shohnaat_token');
  }, []);

  const isAuthenticated = !!getToken();

  return { login, logout, getUser, getToken, isAuthenticated };
}

/* ─────────────────────────────────────────────────────────────
 *  Convenience hooks for common resources
 * ───────────────────────────────────────────────────────────── */
export function useShipments(params?: { page?: number; limit?: number; status?: string }) {
  const query = params || {};
  const qs = new URLSearchParams();
  if (query.page) qs.set('page', String(query.page));
  if (query.limit) qs.set('limit', String(query.limit));
  if (query.status) qs.set('status', query.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  return useApiQuery<unknown[]>(
    ['shipments', JSON.stringify(query)],
    `/api/v1/shipments${suffix}`,
  );
}

export function useShipmentDetail(id: string | null) {
  return useApiQuery<unknown>(
    ['shipment', id ?? ''],
    `/api/v1/shipments/${id}`,
    { enabled: !!id },
  );
}

export function useMerchants() {
  return useApiQuery<unknown[]>(['merchants'], '/api/v1/merchants');
}

export function useRiders() {
  return useApiQuery<unknown[]>(['riders'], '/api/v1/riders');
}

export function useHubs() {
  return useApiQuery<unknown[]>(['hubs'], '/api/v1/hubs');
}
