import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getStories = createAsyncThunk(
  "/stories/get",
  async ({ token, setLoading, page }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API_URL}/posts/stories?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      //   if (Array.isArray(err?.response?.data?.message)) {
      //     toast.error(err?.response?.data?.message[0]);
      //   } else if (err?.response.data.message) {
      //     toast.error(err.response.data.message);
      //   } else {
      //     toast.error("Something went wrong");
      //   }
      return rejectWithValue(err?.response?.data);
    }
  }
);

const storySlice = createSlice({
  name: "stories",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = storySlice.actions;

export default storySlice.reducer;
