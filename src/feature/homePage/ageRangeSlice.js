// src/feature/homePage/ageRangeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// const API_URL = import.meta.env.VITE_API_URL;

export const getAgeRanges = createAsyncThunk(
  "ageRange/getAgeRanges",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/ageranges`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to fetch age ranges",
        error: true,
        status: error?.response?.status,
        details: error?.response?.data,
      });
    }
  }
);

const ageRangeSlice = createSlice({
  name: "ageRange",
  initialState: {
    ageRanges: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAgeRanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAgeRanges.fulfilled, (state, action) => {
      
        state.loading = false;
        state.ageRanges = action.payload?.data?.ageranges;
      })
      .addCase(getAgeRanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.ageRanges = [];
      });
  },
});

export default ageRangeSlice.reducer;
