import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async ({ setLoading, token, customerId }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/stripe/createClientSecret`,
        { customerId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

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
      return rejectWithValue(err.response?.data?.message);
    }
  }
);


export const saveCardDetail = createAsyncThunk("payment/saveCardDetails",
  async ({ token, userId, paymentMethodId }, { rejectWithValue }) => {

    console.log(';;;;;;;;;;;;>>>>>>>>', { token, userId, paymentMethodId });


    try {
      const response = await axios.post(
        `${VITE_API_URL}/stripe/saveCardDetails`,
        { userId, paymentMethodId },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (err) {

      return err?.response?.data
    }
  }
);


export const saveCardPayment = createAsyncThunk(
  "/order/save-payement-card",
  async ({ setLoading, paymentMethodId, token }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/orders/payment/save-card`,
        {
          paymentMethodId: paymentMethodId,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

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

// ADD THIS NEW ACTION
// export const payCharge = createAsyncThunk(
//   'payment/payCharge',
//   async ({ token, planId, amount, paymentMethodId, businessId }, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${VITE_API_URL}/stripe/payCharge`,
//         {
//           planId,
//           amount,
//           paymentMethodId,
//           businessId,
//         },
//         {
//           headers: {
//             Authorization: `${token}`,
//           },
//         }
//       );

//       return response.data;
//     } catch (err) {
//       if (Array.isArray(err?.response?.data?.message)) {
//         toast.error(err?.response?.data?.message[0]);
//       } else if (err?.response.data.message) {
//         toast.error(err.response.data.message);
//       } else {
//         toast.error("Something went wrong with payment");
//       }
//       return rejectWithValue(err?.response?.data);
//     }
//   }
// );
export const payCharge = createAsyncThunk(
  "payment/payCharge",
  async (
    { token, planId, amount, paymentMethodId, businessId, requestId },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/stripe/payCharge`,
        {
          planId: planId ? planId : null,
          ...(requestId && { requestId }),
          amount,
          paymentMethodId,
          businessId,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong with payment");
      }
      return rejectWithValue(err?.response?.data);
    }
  }
);

// ADD THIS NEW ACTION FOR FETCHING SAVED CARDS
export const getSavedCards = createAsyncThunk(
  "payment/getSavedCards",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/stripe/getSavedCards`, // Update this endpoint as per your API
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (err) {
      if (Array.isArray(err?.response?.data?.message)) {
        toast.error(err?.response?.data?.message[0]);
      } else if (err?.response.data.message) {
        toast.error(err.response.data.message);
      }
      // else {
      //   toast.error("Failed to load saved cards");
      // }
      return rejectWithValue(err?.response?.data);
    }
  }
);

export const saveOrder = createAsyncThunk(
  "/order/save-order",
  async ({ setLoading, planId, token }, { rejectWithValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/orders`,
        {
          planId: planId,
        },
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

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    error: null,
    paymentResult: null,
    savedCards: [],
  },
  reducers: {
    clearPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.paymentResult = null;
    },
  },
  extraReducers: (builder) => {
    // Existing reducers for createPaymentIntent, saveCardPayment, saveOrder...

    // ADD THESE NEW REDUCERS
    builder
      // PayCharge reducers
      .addCase(payCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentResult = action.payload;
      })
      .addCase(payCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetSavedCards reducers
      .addCase(getSavedCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedCards.fulfilled, (state, action) => {
        state.loading = false;
        state.savedCards = action.payload?.data?.data || [];
      })
      .addCase(getSavedCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;

export default paymentSlice.reducer;
