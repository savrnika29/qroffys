import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// 🔸 Get Comments
export const getComments = createAsyncThunk(
  "comments/getComments",
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/comments`,
        {
          postId,
          type: "get",
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return {
        postId, // Include postId in the response for reference
        comments: response.data.data.comments,
        totalComments: response.data.data.comments.length, // Include total count
      };
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch comments");
      return rejectWithValue(err?.response?.data);
    }
  }
);

// 🔸 Post Comment
export const postComment = createAsyncThunk(
  "comments/postComment",
  async ({ postId, text, token, parentCommentId }, { rejectWithValue }) => {
    try {

      const payload = {
        postId,
        text,
        type: "post",
      };
      if (parentCommentId) payload.parentCommentId = parentCommentId;

      const response = await axios.post(`${VITE_API_URL}/comments`, payload, {
        headers: {
          Authorization: `${token}`,
        },
      });

      // toast.success("Comment posted successfully");
      
      // Return the new comment along with postId for updating the home post
      return {
        postId,
        comment: response.data.data,
      };
    } catch (err) {
      // toast.error(err?.response?.data?.message || "Failed to post comment");
      return rejectWithValue(err?.response?.data);
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    loading: false,
    error: null,
    currentPostId: null, // Track which post's comments are currently loaded
  },
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.error = null;
      state.currentPostId = null;
    },
    // New action to increment comment count for a specific post
    incrementCommentCount: (state, action) => {
      // This will be handled by the home post slice
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
        state.currentPostId = action.payload.postId;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        // Add the new comment to the current comments list
        if (action.payload.comment) {
          state.comments.push(action.payload.comment);
        }
      });
  },
});

export const { clearComments, incrementCommentCount } = commentSlice.actions;
export default commentSlice.reducer;