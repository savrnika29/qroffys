import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getAllCategories = createAsyncThunk(
  "/category/category",
  async ({ setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/categories`);
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
//////

export const getAllSubcategories = createAsyncThunk(
  "/category/sub-category",
  async ({ setLoading, id }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/categories/${id}`);
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

const categorySlice = createSlice({
  name: "category",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = categorySlice.actions;

export default categorySlice.reducer;
