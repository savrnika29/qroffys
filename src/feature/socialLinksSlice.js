import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getSocialLinks = createAsyncThunk(
  'socialLinks/getSocialLinks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/social-links`);
    //   console.log("Social Links Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to fetch social links",
        error: true,
        status: error?.response?.status,
        details: error?.response?.data,
      });
    }
  }
);

const socialLinksSlice = createSlice({
  name: 'socialLinks',
  initialState: {
    content: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSocialLinks.fulfilled, (state, action) => {
        state.content = action.payload;
        state.error = null;
        // console.log("Social Links Stored:", action.payload);
      })
      .addCase(getSocialLinks.rejected, (state, action) => {
        state.error = action.payload || 'Error fetching social links';
        // console.error("Social Links Fetch Failed:", action.payload);
      });
  },
});

export default socialLinksSlice.reducer;
