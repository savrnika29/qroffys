import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getCountries = createAsyncThunk(
  "/location/countries",
  async ({ setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/location/countries`);
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

export const getStates = createAsyncThunk(
  "/location/states",
  async ({ setLoading, id }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${VITE_API_URL}/location/states`, {
        countryIds: [id],
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

export const getCity = createAsyncThunk(
  "/location/city",
  async ({ setLoading, id }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${VITE_API_URL}/location/cities`, {
        cities: [id],
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      // if (Array.isArray(err?.response?.data?.message)) {
      //   toast.error(err?.response?.data?.message[0]);
      // } else if (err?.response.data.message) {
      //   toast.error(err.response.data.message);
      // } else {
      //   toast.error("Something went wrong");
      // }
      return rejectWithValue(err?.response?.data);
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState: {
    user: null,
    token: "",
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = locationSlice.actions;

export default locationSlice.reducer;
