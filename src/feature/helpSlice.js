// src/features/help/helpSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showAlert } from '../utils/swalHelper';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async action to post help request
export const submitHelpRequest = createAsyncThunk(
  'help/submitHelpRequest',
  async ({ formData, token }, thunkAPI) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/helps`, formData, {
        headers: {
          Authorization: `${token}`,
        },
      });
     showAlert("success", response?.data?.message);
           return response.data;
         } catch (error) {
             showAlert("error", err.response.data.message);
           return thunkAPI.rejectWithValue(error.response?.data || error.message);
         }
  }
);

const helpSlice = createSlice({
  name: 'help',
  initialState: {
    loading: false,
    successMessage: '',
    errorMessage: '',
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = '';
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitHelpRequest.pending, (state) => {
        state.loading = true;
        state.successMessage = '';
        state.errorMessage = '';
      })
      .addCase(submitHelpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Submitted successfully.';
      })
      .addCase(submitHelpRequest.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message || 'Something went wrong.';
      });
  },
});

export const { clearMessages } = helpSlice.actions;
export default helpSlice.reducer;
