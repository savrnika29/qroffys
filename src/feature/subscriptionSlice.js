import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getSubscriptionPlan = createAsyncThunk(
  "subscription/get",
  async ({ page, setLoading, token }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API_URL}/subscription/plans?page=${page}&limit=12`,
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
      if (Array.isArray(err?.response?.data?.message)) {
        showAlert("error", err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);

export const deactivateSubscriptionPlan = createAsyncThunk(
  "subscription/deactivate",
  async ({ planId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/subscription/plans/deactivate`,
        { planId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      showAlert("success", "Subscription plan deactivated successfully!");
      return response.data;
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        showAlert("error", err?.response?.data?.message[0]);
      } else if (err?.response?.data?.message) {
        showAlert("error", err.response.data.message);
      } else {
        showAlert("error", "Something went wrong");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);
/////
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    amount: "",
    currency: "",
    planId: "",
  },
  reducers: {
    subscriptionAdded: (state, action) => {
      state.amount = action?.payload?.amount;
      state.currency = action?.payload?.currency;
    },
    paymentId: (state, action) => {
      state.planId = action?.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const { subscriptionAdded, paymentId } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
