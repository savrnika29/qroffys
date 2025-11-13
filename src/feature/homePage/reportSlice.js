import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showLoginAlert, showAlert } from "../../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const reportPost = createAsyncThunk(
  'report/reportPost',
  async ({ reportedUserId, reason, additionalDetails, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/users-reports`, {
        reportedUserId,
        reason,
        additionalDetails,
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });  

      return response.data;
    } catch (error) { 
        showAlert("error", error.response.data.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(reportPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(reportPost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(reportPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default reportSlice.reducer;