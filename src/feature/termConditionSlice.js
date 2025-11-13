// termConditionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchLegalContent = createAsyncThunk(
  'fetchLegalContent',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/legal-docs/${slug}`);
      return response.data;
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err.response.data.message[0]);
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);

const termConditionSlice = createSlice({
  name: 'terms',
  initialState: {
    content: null,
    error: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLegalContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLegalContent.fulfilled, (state, action) => {
        state.content = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchLegalContent.rejected, (state, action) => {
        state.error = action.payload || 'Error fetching content';
        state.loading = false;
      });
  },
});

export default termConditionSlice.reducer;
