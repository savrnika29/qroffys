
// 🔄 Async thunk to share a post
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const sharePost = createAsyncThunk(
  "post/share",
  async ({ shareData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/shares`,
        shareData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
  
const postShareSlice = createSlice({
  name: 'postShare',
  initialState: {
    loading: false,
    success: false,
    error: null,
    sharedData: null,
  },
  reducers: {
    resetShareState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.sharedData = null;
    },
    updateShareCount: (state, action) => {
      const { postId } = action.payload;
      const story = state.data.find((s) => s._id === postId);
      if (story) {
        story.shareCount = (story.shareCount || 0) + 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sharePost.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.sharedData = action.payload.data;
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetShareState,updateShareCount } = postShareSlice.actions;
export default postShareSlice.reducer;
