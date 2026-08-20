import { Middleware } from '@reduxjs/toolkit';

export const actionLoggerMiddleware: Middleware = () => (next) => (action) => {
  if (process.env.NODE_ENV !== 'production') {
    const startTime = performance.now();
    const result = next(action);
    const duration = (performance.now() - startTime).toFixed(2);

    if (typeof action === 'object' && action !== null && 'type' in action) {
      // Pro discrete telemetry log in dev
      // eslint-disable-next-line no-console
      console.debug(
        `%c[Redux Action] %c${String((action as { type: string }).type)} %c(${duration}ms)`,
        'color: #3b82f6; font-weight: bold;',
        'color: #0f172a; font-weight: 600;',
        'color: #94a3b8; font-size: 11px;'
      );
    }
    return result;
  }

  return next(action);
};
