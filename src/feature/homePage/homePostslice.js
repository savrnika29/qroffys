
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { postComment, getComments } from "../commentSlice";
import { likePost } from "./likeSlice";
import { savePost } from "./saveSlice";
const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchFilteredPosts = createAsyncThunk(
  "posts/fetchFiltered",
  async ({ token, body }, { rejectWithValue }) => {
   
       try {
         const res = await axios.post(`${VITE_API_URL}/posts/home`, body, {
           headers: {
             Authorization: `${token}`,
           },
         });
         return res.data;
       } catch (err) {
         console.error("fetchFilteredPosts error:", err?.response?.data || err.message);
         return rejectWithValue(err?.response?.data || err.message);
       }
     } 
   );

const homepostsSlice = createSlice({
  name: "homepost",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  },
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.hasMore = true;
    },
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
    },
    // toggleLike: (state, action) => {
    //   const { postId, userId } = action.payload;
    //   const post = state.posts.find(p => p._id === postId);
    //   if (post && post.media?.[0]) {
    //     const media = post.media[0];
    //     media.isPostLike = !media.isPostLike;
    //     media.likesCount = media.isPostLike
    //       ? (media.likesCount || 0) + 1
    //       : Math.max(0, (media.likesCount || 0) - 1);
    //   }
    // },
    // toggleSave: (state, action) => {
    //   const { postId } = action.payload;
    //   const post = state.posts.find(p => p._id === postId);
    //   if (post && post.media?.[0]) {
    //     post.media[0].isPostSave = !post.media[0].isPostSave;
    //   }
    // },
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
    incrementCommentCount: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
      }
    },
    // New action for flexible comment count updates
    updateCommentCount: (state, action) => {
      const { postId, increment = true } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        if (increment) {
          post.commentsCount = (post.commentsCount || 0) + 1;
        } else {
          post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        }
      }
    },
    // New action to set exact comment count
    setCommentCount: (state, action) => {
      const { postId, count } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.commentsCount = count;
      }
    },
    incrementShareCount: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.totalShares = (post.totalShares || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFilteredPosts.fulfilled, (state, action) => {
        state.loading = false;
        const { postsDetails, totalPages, currentPage } = action.payload.data;
        state.posts = currentPage === 1 ? postsDetails : [...state.posts, ...postsDetails];
        state.currentPage = currentPage;
        state.totalPages = totalPages;
        state.hasMore = currentPage < totalPages;
      })
      .addCase(fetchFilteredPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch posts";
        state.hasMore = false;
      })
      // Listen for successful comment posting
      .addCase(postComment.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.commentsCount = (post.commentsCount || 0) + 1;
        }
      })
      // Listen for successful comment fetching to sync count
      .addCase(getComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post && comments) {
          post.commentsCount = comments.length;
        }
      })
      // Handle likePost API response
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isPostLike, likesCount } = action.payload;
        state.posts = state.posts.map((post) =>
          post._id === postId
            ? { ...post, isPostLike, likesCount }
            : post
        );
      })
      .addCase(likePost.rejected, (state, action) => {
        // Revert optimistic update on failure
        const { postId } = action.meta.arg;
        state.posts = state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isPostLike: !post.isPostLike,
                likesCount: post.isPostLike
                  ? (post.likesCount || 0) - 1
                  : (post.likesCount || 0) + 1,
              }
            : post
        );
      })
      // Handle savePost API response
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, isPostSave } = action.payload;
        state.posts = state.posts.map((post) =>
          post._id === postId
            ? { ...post, isPostSave }
            : post
        );
      })
      .addCase(savePost.rejected, (state, action) => {
        // Revert optimistic update on failure
        const { postId } = action.meta.arg;
        state.posts = state.posts.map((post) =>
          post._id === postId
            ? { ...post, isPostSave: !post.isPostSave }
            : post
        );
      });
  },
});

export const {
  resetPosts,
  setPosts,
  updatePost,
  toggleLike,
  toggleSave,
  incrementCommentCount,
  incrementShareCount,
} = homepostsSlice.actions;
export default homepostsSlice.reducer;