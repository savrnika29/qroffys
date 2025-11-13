// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { toast } from "react-toastify";

// const VITE_API_URL = import.meta.env.VITE_API_URL;

// export const notifications = createAsyncThunk(
//   "/faq/get",
//   async ({ setLoading, token }, { rejectWithValue }) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${VITE_API_URL}/notifications`, {
//         headers: {
//           Authorization: `${token}`,
//         },
//       });
//       setLoading(false);
//       return response.data;
//     } catch (err) {
//       setLoading(false);
//       if (Array.isArray(err?.response?.data?.message)) {
//         toast.error(err?.response?.data?.message[0]);
//       } else if (err?.response.data.message) {
//         toast.error(err.response.data.message);
//       } else {
//         toast.error("Something went wrong");
//       }
//       return rejectWithValue(err?.response?.data);
//     }
//   }
// );

// const notificationSlice = createSlice({
//   name: "notification",
//   initialState: {},
//   reducers: {},
//   extraReducers: (builder) => {},
// });

// export const {} = notificationSlice.actions;

// export default notificationSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async ({ setLoading, token }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_API_URL}/notifications`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      console.error(
        "getNotifications error:",
        err?.response?.data || err.message
      );
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err?.response?.data?.message[0]);
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data?.notifications || [];
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notifications";
      });
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
