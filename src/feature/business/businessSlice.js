import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch business list
export const fetchBusinesses = createAsyncThunk(
  'business/fetchBusinesses',
  async (role, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/get/businesses?role=${role}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch businesses');
    }
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState: {
    businesses: [],
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearBusinesses: (state) => {
      state.businesses = [];
      state.totalItems = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = action.payload.data.users;
        state.totalItems = action.payload.data.totalItems;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinesses } = businessSlice.actions;
export default businessSlice.reducer;