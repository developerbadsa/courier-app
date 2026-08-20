'use client';

import React, { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './index';
import { setCredentials } from './slices/authSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && storeRef.current) {
      try {
        const token = localStorage.getItem('shohnaat_token');
        const userRaw = localStorage.getItem('shohnaat_user');
        const role = localStorage.getItem('shohnaat_role');

        if (token && userRaw) {
          const user = JSON.parse(userRaw);
          storeRef.current.dispatch(
            setCredentials({
              user,
              token,
              role: role || user.role || user.roles?.[0] || 'merchant',
            })
          );
        }
      } catch {
        // Ignored
      }
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
