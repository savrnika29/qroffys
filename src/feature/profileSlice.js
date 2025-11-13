// src/features/profile/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setUserData } from "./auth/authSlice";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getProfile = createAsyncThunk(
  "profile/get",
  async (token, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/users/me`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      dispatch(setUserData(response.data.data));
      return response.data.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch profile data"
      );
      return rejectWithValue(err?.response?.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async ({ data, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${VITE_API_URL}/users/update-profile`,
        data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Profile updated successfully");
      return response.data.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
      return rejectWithValue(err?.response?.data);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load profile";
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update profile";
      });
  },
});

export default profileSlice.reducer;
