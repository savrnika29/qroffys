import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getMyPosts = createAsyncThunk(
  "mypost/getMyPosts",
  async ({ token, page, type, limit }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/posts/my`,
        { token, page, type, limit },
        { headers: { Authorization: `${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Network error" });
    }
  }
);

const mypostSlice = createSlice({
  name: "mypost",
  initialState: {
    posts: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    updatePost: (state, action) => {
        const { postId, updates } = action.payload;
        state.posts = state.posts.map((post) =>
          post._id === postId ? { ...post, ...updates } : post
        );
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.error) { // Check if request succeeded
          const payloadData = action.payload.data;
          state.posts = payloadData.postsDetails || [];
          state.totalItems = payloadData.totalItems || 0;
          state.totalPages = payloadData.totalPages || 1;
          state.currentPage = payloadData.currentPage || 1;
        }
      })
      .addCase(getMyPosts.rejected, (state, action) => {
        state.loading = false;
        state.posts = [];
        state.error = action.payload?.message || "Failed to fetch posts";
      });
  },
});

export const { updatePost } = mypostSlice.actions;
export default mypostSlice.reducer;