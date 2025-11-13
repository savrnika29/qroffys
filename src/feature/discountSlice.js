import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching discount by ID
export const fetchDiscountById = createAsyncThunk(
  'discount/fetchById',
  async ({ discountId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/discount-offers/${discountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discount');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    discountData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDiscountData: (state) => {
      state.discountData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.discountData = action.payload;
      })
      .addCase(fetchDiscountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDiscountData } = discountSlice.actions;
export default discountSlice.reducer;