import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipmentsReducer from './slices/shipmentsSlice';
import pickupsReducer from './slices/pickupsSlice';
import uiReducer from './slices/uiSlice';
import financeReducer from './slices/financeSlice';

import { tokenSyncMiddleware } from './middleware/tokenSyncMiddleware';
import { errorToastMiddleware } from './middleware/errorToastMiddleware';
import { actionLoggerMiddleware } from './middleware/actionLoggerMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  shipments: shipmentsReducer,
  pickups: pickupsReducer,
  ui: uiReducer,
  finance: financeReducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/setCredentials'],
        },
      }).concat(
        tokenSyncMiddleware,
        errorToastMiddleware,
        actionLoggerMiddleware
      ),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
