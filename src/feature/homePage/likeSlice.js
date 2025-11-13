// src/features/like/likeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// POST like thunk
export const likePost = createAsyncThunk(
  "likes/post",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/likes`,
        { postId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      // toast.success(response.data.message); // optional
      return response.data;
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err?.response?.data?.message[0]);
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);
 
const likeSlice = createSlice({
    name: "likes",
    initialState: {
      likeData: null,
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(likePost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(likePost.fulfilled, (state, action) => {
          state.loading = false;
          state.likeData = action.payload.data; // contains userId, postId, etc.
        })
        .addCase(likePost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error occurred";
        });
    },
  });
  
  export default likeSlice.reducer;
  