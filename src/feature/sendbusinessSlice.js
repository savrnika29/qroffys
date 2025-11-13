import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk for the POST API call
export const sendBusinessRequest = createAsyncThunk(
  "business/sendBusinessRequest",
  async ({ businessId, amount, token }, { rejectWithValue }) => {
    if (!token) {
      return rejectWithValue({
        message: "No token provided",
        error: true,
        status: 401,
      });
    }
    try {
      const response = await axios.post(
        `${VITE_API_URL}/users/businesses`,
        {
          businessId,
          amount,
        },
        {
          headers: {
            Authorization: `${token}`, // Ensure Bearer prefix
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data; // Return business and discountedPrice
    } catch (error) {
      if (Array.isArray(err?.response?.data?.message)) {
        showAlert("error", err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
          error: true,
          status: 500,
        }
      );
    }
  }
);

export const sendPaymentRequest = createAsyncThunk(
  "business/sendPaymentRequest",
  async ({ customerId, amount, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/stripe/payment-requests`,
        {
          customerId: customerId ? customerId : "",
          amount,
        },
        {
          headers: {
            Authorization: `${token}`, // Ensure Bearer prefix
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data; // Return business and discountedPrice
    } catch (error) {
      if (Array.isArray(error?.response?.data?.message)) {
        showAlert("error", error?.response?.data?.message[0]);
      } else if (error?.response.data.message) {
        showAlert("error", error.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
          error: true,
          status: 500,
        }
      );
    }
  }
);

const businessSlice = createSlice({
  name: "sendbusiness",
  initialState: {
    business: null,
    discountedPrice: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBusinessData: (state) => {
      state.business = null;
      state.discountedPrice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendBusinessRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendBusinessRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.business = action.payload.business;
        state.discountedPrice = action.payload.discountedPrice;
      })
      .addCase(sendBusinessRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // This will capture the 401 error details
      });
  },
});

export const { clearBusinessData } = businessSlice.actions;
export default businessSlice.reducer;
