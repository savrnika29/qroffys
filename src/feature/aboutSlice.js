// src/features/about/aboutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk
export const fetchAbout = createAsyncThunk('about/fetchAbout', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${VITE_API_URL }/aboutUs`);
    return response.data.data; // the actual "data" object from API
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    aboutData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAbout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.aboutData = action.payload;
      })
      .addCase(fetchAbout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default aboutSlice.reducer;
