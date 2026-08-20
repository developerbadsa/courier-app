import { Middleware, isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import { showToast } from '@/lib/api';

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action) || isRejected(action)) {
    const errorPayload = action.payload as { message?: string } | undefined;
    const errorMessage =
      errorPayload?.message ||
      action.error?.message ||
      'An unexpected state error occurred. Please try again.';

    showToast('error', errorMessage);
  }

  return next(action);
};
