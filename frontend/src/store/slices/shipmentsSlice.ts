import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShipmentItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  destinationCity: string;
  status: string;
  weightKg: number;
  codAmount: number;
  createdAt: string;
}

export interface ShipmentFilters {
  status: string;
  dateRange: string;
  search: string;
  city: string;
}

export interface ShipmentsState {
  items: ShipmentItem[];
  selectedShipment: ShipmentItem | null;
  filters: ShipmentFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  items: [],
  selectedShipment: null,
  filters: {
    status: 'ALL',
    dateRange: 'ALL',
    search: '',
    city: 'ALL',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
};

export const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    setShipments: (
      state,
      action: PayloadAction<{ items: ShipmentItem[]; total?: number }>
    ) => {
      state.items = action.payload.items;
      if (action.payload.total !== undefined) {
        state.pagination.total = action.payload.total;
      }
      state.loading = false;
      state.error = null;
    },
    addShipment: (state, action: PayloadAction<ShipmentItem>) => {
      state.items.unshift(action.payload);
      state.pagination.total += 1;
    },
    setSelectedShipment: (state, action: PayloadAction<ShipmentItem | null>) => {
      state.selectedShipment = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<Partial<ShipmentFilters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'ALL',
        dateRange: 'ALL',
        search: '',
        city: 'ALL',
      };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ShipmentsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setShipmentsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setShipmentsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setShipments,
  addShipment,
  setSelectedShipment,
  setFilter,
  clearFilters,
  setPagination,
  setShipmentsLoading,
  setShipmentsError,
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer;
