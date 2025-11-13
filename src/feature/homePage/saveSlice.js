import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const savePost = createAsyncThunk(
  'post/savePost',
  async ({ postId, token }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/qasts/save/${postId}`,
        {},
        {
          headers: { Authorization: `${token}` },
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
      return thunkAPI.rejectWithValue(err.response?.data || error.message);
    }
  }
);

const saveSlice = createSlice({
  name: 'savePost',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(savePost.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(savePost.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(savePost.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default saveSlice.reducer;
