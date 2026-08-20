import { Middleware } from '@reduxjs/toolkit';
import { setCredentials, logout } from '../slices/authSlice';

export const tokenSyncMiddleware: Middleware = () => (next) => (action) => {
  if (setCredentials.match(action)) {
    const { token, user } = action.payload;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('shohnaat_token', token);
        localStorage.setItem('shohnaat_user', JSON.stringify(user));
        localStorage.setItem('shohnaat_role', user.role || user.roles?.[0] || 'merchant');
      } catch {
        // Ignored
      }
    }
  }

  if (logout.match(action)) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('shohnaat_token');
        localStorage.removeItem('shohnaat_user');
        localStorage.removeItem('shohnaat_role');
      } catch {
        // Ignored
      }
    }
  }

  return next(action);
};
