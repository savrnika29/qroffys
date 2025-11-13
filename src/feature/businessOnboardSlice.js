// src/features/businessOnboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk for calling the /stripe/business-onboard API
export const onboardBusiness = createAsyncThunk(
  "businessOnboard/onboardBusiness",
  async (businessId, { rejectWithValue, getState }) => {
    try {
      // Retrieve the token from Redux store (adjust path based on your store structure)
      const { auth } = getState(); // Assuming token is stored in auth slice
      const token = auth.token; // Adjust this based on your state structure

      // Make the API request with Authorization header
      const response = await axios.post(
        `${VITE_API_URL}/stripe/business-onboard`,
        { businessId },
        {
          headers: {
            Authorization: `${token}`, // Include the token in the headers
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to onboard business"
      );
    }
  }
);

export const onBoardStatusData = createAsyncThunk(
  "/businessOnboard/on-board-data",
  async ({ payload, token, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/stripe/business-onboard`,
        payload,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      if (Array.isArray(err?.response?.data?.message)) {
        showAlert("error", err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);
const businessOnboardSlice = createSlice({
  name: "businessOnboard",
  initialState: {
    Onboard: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(onboardBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(onboardBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.Onboard = action.payload;
      })
      .addCase(onboardBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default businessOnboardSlice.reducer;
