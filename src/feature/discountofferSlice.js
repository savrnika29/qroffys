import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchDiscountOffers = createAsyncThunk(
    "discountOffers/fetch",
    async ({token}, { rejectWithValue }) => {
      try {
        // const token = localStorage.getItem("token"); // Adjust key if different
  
        const response = await axios.get(`${VITE_API_URL}/discount-offers`, {
          headers: {
            Authorization: `${token}`, // or just token if that's how your API expects it
          },
        });
  
        return response.data.data.offers;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  


const discountOfferSlice = createSlice({
  name: "discountOffers",
  initialState: {
    offers: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload;
      })
      .addCase(fetchDiscountOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default discountOfferSlice.reducer;
