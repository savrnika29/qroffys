// src/features/background/backgroundSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getBackgroundImages = createAsyncThunk(
  "background/get",
  async ({ setLoading, token }, { rejectWithValue }) => {
    try {
      if (setLoading) setLoading(true);

      const response = await axios.get(`${VITE_API_URL}/background-images`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (setLoading) setLoading(false);

      return response?.data?.data?.backgroundImages;
    } catch (err) {
      if (setLoading) setLoading(false);

      // Removed all toast.error messages
      return rejectWithValue(err?.response?.data);
    }
  }
);

const backgroundSlice = createSlice({
  name: "background",
  initialState: {
    images: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBackgroundImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBackgroundImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(getBackgroundImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load background images";
      });
  },
});

export default backgroundSlice.reducer;
