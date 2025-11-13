import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const faqData = createAsyncThunk(
  "/faq/get",
  async ({ setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/faqs`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);

const faqSlice = createSlice({
  name: "faq",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = faqSlice.actions;

export default faqSlice.reducer;
