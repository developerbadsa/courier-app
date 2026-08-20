import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PickupItem {
  id: string;
  address: string;
  addressLabel: string;
  city: string;
  requestedDate: string;
  timeSlot: string;
  parcelCount: number;
  vehicleType: string;
  driverNotes: string;
  status: string;
  riderName: string | null;
  createdAt: string;
}

export interface DraftPickupForm {
  addressId: string;
  requestedDate: string;
  timeSlot: string;
  parcelCount: string;
  vehicleType: string;
  driverNotes: string;
}

export interface PickupsState {
  items: PickupItem[];
  activeTab: string;
  draftForm: DraftPickupForm;
  selectedPickup: PickupItem | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialDraftForm: DraftPickupForm = {
  addressId: '',
  requestedDate: '',
  timeSlot: 'MORNING',
  parcelCount: '',
  vehicleType: 'VAN',
  driverNotes: '',
};

const initialState: PickupsState = {
  items: [],
  activeTab: 'all',
  draftForm: initialDraftForm,
  selectedPickup: null,
  loading: false,
  submitting: false,
  error: null,
};

export const pickupsSlice = createSlice({
  name: 'pickups',
  initialState,
  reducers: {
    setPickups: (state, action: PayloadAction<PickupItem[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPickup: (state, action: PayloadAction<PickupItem>) => {
      state.items.unshift(action.payload);
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedPickup: (state, action: PayloadAction<PickupItem | null>) => {
      state.selectedPickup = action.payload;
    },
    updateDraftForm: (
      state,
      action: PayloadAction<Partial<DraftPickupForm>>
    ) => {
      state.draftForm = { ...state.draftForm, ...action.payload };
    },
    resetDraftForm: (state) => {
      state.draftForm = initialDraftForm;
    },
    setPickupsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPickupsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },
    setPickupsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
      state.submitting = false;
    },
  },
});

export const {
  setPickups,
  addPickup,
  setActiveTab,
  setSelectedPickup,
  updateDraftForm,
  resetDraftForm,
  setPickupsLoading,
  setPickupsSubmitting,
  setPickupsError,
} = pickupsSlice.actions;

export default pickupsSlice.reducer;
