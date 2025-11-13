import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch payment history
export const getPaymentHistory = createAsyncThunk(
  "paymentHistory/getPaymentHistory",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/payment/histories`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
           
export const downloadPaymentInvoice = createAsyncThunk("paymentHistory/invoice",
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/payment/invoice/${id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
); 

const paymentHistorySlice = createSlice({
  name: "paymentHistory",
  initialState: {
    payments: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentHistoryState: (state) => {
      state.payments = [];
      state.totalItems = 0;
      state.currentPage = 1;
      state.totalPages = 1;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.totalItems = action.payload.data.totalItems;
        state.currentPage = action.payload.data.currentPage;
        state.totalPages = action.payload.data.totalPages;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch payment history";
      });
  },
});

export const { clearPaymentHistoryState } = paymentHistorySlice.actions;
export default paymentHistorySlice.reducer;