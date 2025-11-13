import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch users using Axios
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (data, { rejectWithValue }) => {
    try {
      const VITE_API_URL = import.meta.env.VITE_API_URL;

      const endpoint =
        data.userProfile === "customer"
          ? "/users/get/businesses?role=business"
          : "/users/get/businesses?role=customer";

      const response = await axios.get(`${VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `${data.token}`,
        },
      });

      if (response.data.error === false && response.data.data.users) {
        return response.data.data.users;
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load users"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    usersList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.usersList = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load users";
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
