import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getSavedPostandStories = createAsyncThunk(
  "savedPostandStories/get",
  async ({ token, page = 1 }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${VITE_API_URL}/qasts/saved?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { response: { data: err, status: res.status } };
      }

      const result = await res.json();
      return { ...result?.data, page }; // attach page number
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  }
);

const savedPostandStoriesSlice = createSlice({
  name: "savedPostandStories",
  initialState: {
    items: { postsDetails: [] }, // keep the structure consistent
    loading: false,
    error: null,
  },
  reducers: {
    updateSavedPost: (state, action) => {
      const updatedPost = action.payload;
      if (!state.items?.postsDetails) return;
      const index = state.items.postsDetails.findIndex(
        (p) => p._id === updatedPost._id
      );
      if (index !== -1) {
        state.items.postsDetails[index] = updatedPost;
      }
    },
    toggleLike: (state, action) => {
      const postId = action.payload;
      if (!state.items?.postsDetails) return;
      const post = state.items.postsDetails.find((p) => p._id === postId);
      if (post) {
        post.isPostLike = !post.isPostLike;
        post.likesCount = (post.likesCount || 0) + (post.isPostLike ? 1 : -1);
      }
    },
    incrementBusinessPostComments: (state, action) => {
      const { postId, commentsCount } = action.payload;
      if (!state.items?.postsDetails) {
        return;
      }
      const post = state.items.postsDetails.find((p) => p._id === postId);
      if (post) {
        const previousCount = post.commentsCount || 0;
        post.commentsCount = commentsCount || previousCount + 1;
      } else {
      }
    },
    toggleSave: (state, action) => {
      const postId = action.payload;
      if (!state.items?.postsDetails) return;
      const post = state.items.postsDetails.find((p) => p._id === postId);
      if (post) {
        post.isPostSave = !post.isPostSave;
        // Optionally update saveCount if your API tracks it
        post.saveCount = (post.saveCount || 0) + (post.isPostSave ? 1 : -1);
      }
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      if (!state.items?.postsDetails) return;
      state.items.postsDetails = state.items.postsDetails.map((post) =>
        post._id === postId ? { ...post, ...updates } : post
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSavedPostandStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedPostandStories.fulfilled, (state, action) => {
        const payload = action.payload || { postsDetails: [] };
        state.loading = false;
        state.error = null;

        if (payload.page === 1) {
          // First load → replace
          state.items = payload;
        } else {
          // Next pages → append
          state.items.postsDetails = [
            ...state.items.postsDetails,
            ...payload.postsDetails,
          ];
          state.items.currentPage = payload.currentPage;
          state.items.totalPages = payload.totalPages;
          state.items.totalItems = payload.totalItems;
        }
      })
      .addCase(getSavedPostandStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedPost, toggleLike, toggleSave, updatePost, incrementBusinessPostComments } = savedPostandStoriesSlice.actions;
export default savedPostandStoriesSlice.reducer;
