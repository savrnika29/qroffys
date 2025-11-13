// src/feature/businessSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Async thunk to fetch business/user data by ID

export const fetchBusinessById = createAsyncThunk(
  'business/fetchBusinessById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/users/${userId}`);
      // API returns a single user object in `response.data`
      return response.data.data; // Extract the user object from `data`
    } catch (error) {
      console.error('Error fetching user data:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }

// export const fetchBusinessById = createAsyncThunk("business/fetchBusinessById", async (userId, { rejectWithValue }) => {
//   try {
//     const response = await axios.get(`${VITE_API_URL}/users/${userId}`);
//     // API returns a single user object in `response.data`
//     return response.data.data; // Extract the user object from `data`
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return rejectWithValue(error.response?.data?.message || "Failed to fetch user data");

//   }
});

const businessSlice = createSlice({
  name: "business",
  initialState: {
    businessData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBusinessData: (state) => {
      state.businessData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessById.fulfilled, (state, action) => {
        state.loading = false;
        state.businessData = action.payload;
      })
      .addCase(fetchBusinessById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinessData } = businessSlice.actions;
export default businessSlice.reducer;
