import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchTerms = createAsyncThunk(
  "terms/fetch",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/legal-docs/terms`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return response.data.data?.description; // assuming 'description' has the HTML
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch terms");
    }
  }
);

const termsSlice = createSlice({
  name: "terms",
  initialState: {
    termsData: "",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerms.fulfilled, (state, action) => {
        state.loading = false;
        state.termsData = action.payload?.data?.content || "";
    })
      .addCase(fetchTerms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default termsSlice.reducer;
