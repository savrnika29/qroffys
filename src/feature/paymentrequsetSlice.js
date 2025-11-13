import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Async thunk to fetch payment requests
export const fetchPaymentRequests = createAsyncThunk(
  "paymentRequests/fetchPaymentRequests",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from Redux state
      const { auth } = getState();
      const token = auth.token;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Add authorization header if token exists
      if (token) {
        config.headers.Authorization = `${token}`;
      }

      const response = await axios.get(
        `${VITE_API_URL}/stripe/payment-requests`,
        config
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Error fetching payment requests"
      );
    }
  }
);

// Async thunk to approve payment request
export const approvePaymentRequest = createAsyncThunk(
  "paymentRequests/approvePaymentRequest",
  async (requestId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        config.headers.Authorization = `${token}`;
      }

      const response = await axios.put(
        `${VITE_API_URL}/stripe/payment-requests/${requestId}/approve`,
        {},
        config
      );
      return { requestId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Error approving payment request"
      );
    }
  }
);

// Async thunk to decline payment request
export const declinePaymentRequest = createAsyncThunk(
  "paymentRequests/declinePaymentRequest",
  async (requestId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const config = {
        headers: { "Content-Type": "application/json" },
      };
      if (token) config.headers.Authorization = `${token}`;

      const response = await axios.patch(
        `${VITE_API_URL}/stripe/payment-requests/${requestId}`,
        {},
        config
      );

      showAlert("success", response?.data?.message);
      return { requestId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error declining payment request"
      );
    }
  }
);

const paymentRequestsSlice = createSlice({
  name: "paymentRequests",
  initialState: {
    paymentRequests: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    approveStatus: "idle",
    declineStatus: "idle",
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
      state.approveStatus = "idle";
      state.declineStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment requests
      .addCase(fetchPaymentRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.paymentRequests =
          action.payload.paymentRequests || action.payload;
        state.totalItems =
          action.payload.totalItems || action.payload.length || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.error = null;
      })
      .addCase(fetchPaymentRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Approve payment request
      .addCase(approvePaymentRequest.pending, (state) => {
        state.approveStatus = "loading";
      })
      .addCase(approvePaymentRequest.fulfilled, (state, action) => {
        state.approveStatus = "succeeded";
        // Update the specific request in the array
        const index = state.paymentRequests.findIndex(
          (req) => req.id === action.payload.requestId
        );
        if (index !== -1) {
          state.paymentRequests[index] = {
            ...state.paymentRequests[index],
            status: "approved",
            ...action.payload.data,
          };
        }
      })
      .addCase(approvePaymentRequest.rejected, (state, action) => {
        state.approveStatus = "failed";
        state.error = action.payload;
      })

      // Decline payment request
      .addCase(declinePaymentRequest.pending, (state) => {
        state.declineStatus = "loading";
      })
      .addCase(declinePaymentRequest.fulfilled, (state, action) => {
        state.declineStatus = "succeeded";
        // Update the specific request in the array
        const index = state.paymentRequests.findIndex(
          (req) => req.id === action.payload.requestId
        );
        if (index !== -1) {
          state.paymentRequests[index] = {
            ...state.paymentRequests[index],
            status: "declined",
            ...action.payload.data,
          };
        }
      })
      .addCase(declinePaymentRequest.rejected, (state, action) => {
        state.declineStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError, resetStatus } = paymentRequestsSlice.actions;
export default paymentRequestsSlice.reducer;
