import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LedgerEntry {
  id: string;
  type: 'COD_COLLECTED' | 'DELIVERY_FEE' | 'RETURN_FEE' | 'SETTLEMENT' | 'ADJUSTMENT';
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface PayoutRequestItem {
  id: string;
  amount: number;
  method: 'bank_transfer' | 'paypal';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  requestedAt: string;
  reference?: string;
}

export interface FinanceSummary {
  availableBalance: number;
  pendingSettlement: number;
  totalWithdrawn: number;
  lifetimeEarnings: number;
}

export interface FinanceState {
  summary: FinanceSummary;
  ledger: LedgerEntry[];
  payouts: PayoutRequestItem[];
  selectedPayout: PayoutRequestItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  summary: {
    availableBalance: 8420.5,
    pendingSettlement: 1250.0,
    totalWithdrawn: 34200.0,
    lifetimeEarnings: 43870.5,
  },
  ledger: [],
  payouts: [],
  selectedPayout: null,
  loading: false,
  error: null,
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setFinanceSummary: (state, action: PayloadAction<FinanceSummary>) => {
      state.summary = action.payload;
    },
    setLedger: (state, action: PayloadAction<LedgerEntry[]>) => {
      state.ledger = action.payload;
    },
    setPayouts: (state, action: PayloadAction<PayoutRequestItem[]>) => {
      state.payouts = action.payload;
    },
    addPayoutRequest: (state, action: PayloadAction<PayoutRequestItem>) => {
      state.payouts.unshift(action.payload);
      state.summary.availableBalance -= action.payload.amount;
      state.summary.pendingSettlement += action.payload.amount;
    },
    setSelectedPayout: (state, action: PayloadAction<PayoutRequestItem | null>) => {
      state.selectedPayout = action.payload;
    },
    setFinanceLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFinanceError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setFinanceSummary,
  setLedger,
  setPayouts,
  addPayoutRequest,
  setSelectedPayout,
  setFinanceLoading,
  setFinanceError,
} = financeSlice.actions;

export default financeSlice.reducer;
