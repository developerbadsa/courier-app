import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  notifications: UiNotification[];
  unreadNotificationCount: number;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  activeModal: null,
  modalData: null,
  notifications: [
    {
      id: 'notif-1',
      type: 'success',
      title: 'Settlement Processed',
      message: 'Weekly COD settlement #INV-2026-089 has been transferred.',
      read: false,
      createdAt: '10m ago',
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Pickup Assigned',
      message: 'Rider David Miller has been assigned to Pickup PK-001.',
      read: false,
      createdAt: '1h ago',
    },
  ],
  unreadNotificationCount: 2,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileNav: (state) => {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<{ modalId: string; data?: Record<string, unknown> }>
    ) => {
      state.activeModal = action.payload.modalId;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadNotificationCount = 0;
    },
    addNotification: (state, action: PayloadAction<Omit<UiNotification, 'id' | 'createdAt' | 'read'>>) => {
      state.notifications.unshift({
        id: `notif-${Date.now()}`,
        ...action.payload,
        read: false,
        createdAt: 'Just now',
      });
      state.unreadNotificationCount += 1;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileNav,
  setMobileNavOpen,
  openModal,
  closeModal,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
