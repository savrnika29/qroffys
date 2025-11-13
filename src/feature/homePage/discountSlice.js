import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getDiscountOffer = createAsyncThunk(
  'discountOffer/getDiscountOffer',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/discount-offers`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to fetch discount offer",
        error: true,
        status: error?.response?.status,
        details: error?.response?.data,
      });
    }
  }
);

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    content: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDiscountOffer.fulfilled, (state, action) => {
        state.content = action.payload;
        state.error = null;
      })
      .addCase(getDiscountOffer.rejected, (state, action) => {
        state.error = action.payload || 'Error fetching discount offer';
      });
  },
});

export default discountSlice.reducer;
