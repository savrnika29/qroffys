// src/features/faceAuth/faceAuthSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for face login
export const faceLogin = createAsyncThunk(
  "faceAuth/faceLogin",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-faces/login`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        return res.data.data.user;
      } else {
        return rejectWithValue(res.data.message || "Face authentication failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const faceAuthSlice = createSlice({
  name: "faceAuth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutFaceAuth(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(faceLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(faceLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(faceLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutFaceAuth } = faceAuthSlice.actions;
export default faceAuthSlice.reducer;
