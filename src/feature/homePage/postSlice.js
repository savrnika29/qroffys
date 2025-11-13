import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ token, body = {}, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/home`, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: "10", // Default limit
          page: "1", // Default page
          ...body, // Merge provided body (e.g., search, targetedState)
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || "Failed to fetch posts");
      }
      return data.data; // Return the `data` object containing postsDetails, totalItems, etc.
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      setLoading(false);
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        
        state.posts = action.payload.postsDetails || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default postSlice.reducer;