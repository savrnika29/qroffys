import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { showLoginAlert, showAlert } from "../../utils/swalHelper";
const COOKIE_EXPIRE_DAYS = Number(import.meta.env.VITE_COOKIE_EXPIRE_DAYS) || 7;
const VITE_API_URL = import.meta.env.VITE_API_URL;
import api from "../../app/axiosinstan";
// Async thunk to call registration API
export const signUp = createAsyncThunk(
  "/auth/sign-up",
  async ({ payload, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/auth/registers`,
        payload
      );
      setLoading(false);
      showAlert("success", response?.data?.message);
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

export const forgotPassword = createAsyncThunk(
  "/auth/forgot-password",
  async ({ payload, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${VITE_API_URL}/auth/forgot`, payload);
      setLoading(false);
      showAlert("success", response?.data?.message);
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

export const ApproveLink = createAsyncThunk(
  "/auth/approve-way",
  async ({ token, action, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API_URL}/auth/confirm?token=${token}&action=${action}`
      );
      setLoading(false);
      showAlert("success", response?.data?.message);
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
export const userDataInfo = createAsyncThunk(
  "/auth/user-info",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/users/info/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data);
    }
  }
);

export const login = createAsyncThunk(
  "/auth/login",
  async ({ payload, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${VITE_API_URL}/auth/login`, payload);
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

export const sendVerification = createAsyncThunk(
  "/auth/send-verification-code",
  async ({ payload, setLoading }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/auth/account/verify`,
        payload
      );
      setLoading(false);
      showAlert("success", response?.data?.message);
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

export const faceRegister = createAsyncThunk(
  "/auth/user-faces/register",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/user-faces/register`,
        formData, // sending FormData
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data", // important for file upload
          },
        }
      );
      return response.data;
    } catch (err) {
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

// ✅ Redux Thunk
export const faceLogin = createAsyncThunk(
  "/auth/face-login",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/user-faces/login`,
        formData, // sending FormData
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data", // important for file upload
          },
        }
      );
      return response.data;
    } catch (err) {
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

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: Cookies.get("token") || null,
    role: Cookies.get("role") || null,
    fcmToken: null,
  },
  reducers: {
    clearAuthState: (state) => {
      state.user = "";
      state.token = "";
      Cookies.remove("token");
      Cookies.remove("role");
    },

    setUserInfo: (state, action) => {
      if (action?.payload) {
        state.user = action?.payload?.user;
        state.token = action?.payload?.token;
        state.coins = action?.payload?.coins;
      }
    },
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {})
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.data;
          state.token = action.payload.data?.token;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // .addCase(faceLogin.pending, (state) => {})

    // .addCase(faceLogin.fulfilled, (state, action) => {
    // //  state.user = action.payload.data;
    //   // state.token = action.payload.data?.token;
    // })

    // .addCase(faceLogin.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const { clearAuthState, setUserInfo, setUserData } = authSlice.actions;

export default authSlice.reducer;
