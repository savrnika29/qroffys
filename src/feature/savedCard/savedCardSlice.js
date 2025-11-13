// src/features/savedCards/savedCardsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getSavedCards = createAsyncThunk(
  "savedCards/get",
  async ({ customerId, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${VITE_API_URL}/orders/get-saved-cards`, {
        method: "Get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,   // or just token if backend wants that
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { response: { data: err, status: res.status } };
      }

      const result = await res.json();
      return result?.data?.data ?? [];
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  }
);


const savedCardsSlice = createSlice({
  name: "savedCards",
  initialState: {
    cards: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSavedCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedCards.fulfilled, (state, action) => {
        state.cards = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getSavedCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default savedCardsSlice.reducer;