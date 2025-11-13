// src/features/newQast/newQastSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk to submit new qast
export const submitNewQast = createAsyncThunk(
  "newQast/submit",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/posts`, formData, {
        headers: {
          Authorization: `${token}`,
        },
      });
      // showAlert("success", response?.data?.message);
      return response.data;
    } catch (err) {
      // showAlert("error", err.response?.data?.message || "Submission failed");
      return rejectWithValue(err.response?.data || "Submission failed");
    }
  }
);

export const deleteQastData = createAsyncThunk(
  "newQast/delete",
  async ({ id, token, setLoader }, { rejectWithValue }) => {
    try {
      setLoader(true);
      const response = await axios.delete(`${VITE_API_URL}/posts/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return response.data;
    } catch (err) {
      setLoader(false);
      if (Array.isArray(err?.response?.data?.message)) {
        showAlert("error", err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(err.response?.data || "Submission failed");
    }
  }
);

const newQastSlice = createSlice({
  name: "newQast",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetNewQastState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitNewQast.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitNewQast.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitNewQast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetNewQastState } = newQastSlice.actions;
export default newQastSlice.reducer;
