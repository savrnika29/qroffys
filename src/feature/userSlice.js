import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getUsers = createAsyncThunk(
  "/user/users/get/businesses",
  async ({ token, setLoading, search, page }, { rejectWithValue }) => {
    try {
      setLoading(true);
      let url;
      if (search) {
        page = 1;
        url = `${VITE_API_URL}/users?role=business&search=${search}&page=${page}`;
      } else {
        url = `${VITE_API_URL}/users?role=business&page=${page}`;
      }
      const response = await axios.get(url, {
        headers: {
          Authorization: `${token}`,
        },
      });
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

const userSlice = createSlice({
  name: "user",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => { },
});

export const { } = userSlice.actions;

export default userSlice.reducer;
