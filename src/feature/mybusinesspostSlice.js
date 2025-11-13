import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Async thunk to fetch posts
export const fetchMyBusinessPosts = createAsyncThunk(
  'mybusinessposts/fetchMyBusinessPosts',
  async ({ userId, page, limit, type }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("token");
      
      const response = await axios.post(
        `${VITE_API_URL}/posts/my`,
        {
          userId,
          page,
          limit,
          type,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
    }
  }
);
     
 
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
const mybusinesspostSlice = createSlice({
  name: 'mybusinessposts',
  initialState: {
    posts: [],
    totalItems: 0,
    totalFilteredItems: 0,
    currentPage: 1,
    totalPages: 0,
    totalFollowers: 0,  // Add this
    totalFollowings: 0, // Add this
    profileUser: null,  // Add this to store user profile data
    loading: false,
    error: null,
  },
  reducers: {
    clearMyBusinessPostsData: (state) => {
      state.posts = [];
      state.totalItems = 0;
      state.totalFilteredItems = 0;
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalFollowers = 0;
      state.totalFollowings = 0;
      state.profileUser = null;
      state.loading = false;
      state.error = null;
    },reducers: {
      updateFollowerCount: (state, action) => {
        const { type } = action.payload;
        if (type === "follow") {
          state.totalFollowers += 1; // Increment followers
        } else if (type === "unfollow") {
          state.totalFollowers = Math.max(0, state.totalFollowers - 1); // Decrement followers, ensure non-negative
        }
      },
    },
    updatePost: (state, action) => {
        const { postId, updates } = action.payload;
        state.posts = state.posts.map((post) =>
          post._id === postId ? { ...post, ...updates } : post
        );
      },
    incrementBusinessPostComments: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
      }
    },
    toggleLike: (state, action) => {
      const { postId } = action.payload;
      state.posts = state.posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isPostLike: !post.isPostLike, // Update at root level
              likesCount: post.isPostLike
                ? (post.likesCount || 0) - 1
                : (post.likesCount || 0) + 1, // Optimistically update likesCount
            }
          : post
      );
    },
    toggleSave: (state, action) => {
      const { postId } = action.payload;
      state.posts = state.posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isPostSave: !post.isPostSave, // Update at root level
            }
          : post
      );
    },
  },
  extraReducers: (builder) => 
    {
      builder
        .addCase(fetchMyBusinessPosts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMyBusinessPosts.fulfilled, (state, action) => {
          state.loading = false;
          const responseData = action.payload.data;
          
          state.posts = responseData.postsDetails;
          state.totalItems = responseData.totalItems;
          state.totalFilteredItems = responseData.totalFilteredItems;
          state.currentPage = responseData.currentPage;
          state.totalPages = responseData.totalPages;
          
          // Extract follower data from API response
          state.totalFollowers = responseData.totalFollowers || 0;
          state.totalFollowings = responseData.totalFollowings || 0;
          
          // Store profile user data from first post if available
          if (responseData.postsDetails && responseData.postsDetails.length > 0) {
            state.profileUser = responseData.postsDetails[0].user;
          }
        })
        .addCase(fetchMyBusinessPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })  
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

export const { clearMyBusinessPostsData, updatePost, incrementBusinessPostComments, toggleLike, toggleSave } = mybusinesspostSlice.actions;
export default mybusinesspostSlice.reducer;