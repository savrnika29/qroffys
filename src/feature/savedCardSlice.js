// src/feature/savedCard/savedCardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { showAlert } from "../utils/swalHelper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getSavedCardvedio = createAsyncThunk(
  "savedCards/getSavedCards",
  async ({ token, customerId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/stripe/savedCards/${customerId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data.data.cards || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSavedCard = createAsyncThunk(
  "savedCards/deleteSavedCard",
  async ({ token, paymentMethodId }, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${VITE_API_URL}/stripe/deleteSavedCards/${paymentMethodId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Card deleted successfully");
      // showAlert("success", "Card deleted successfully");
      return {
        paymentMethodId,
        // message: response.data.message || "Card deleted successfully",
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getSavedCardBusiness = createAsyncThunk(
  "savedCards/getSavedCardBusiness",
  async ({ token, businessId, setBusinessType }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/stripe/business/${businessId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setBusinessType(response.data.data?.business_type);
      return response.data.data?.payoutDetails?.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
const savedCardSlice = createSlice({
  name: "savedCards",
  initialState: {
    cardvedio: [],
    savedCardDetails: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSavedCardvedio.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSavedCardvedio.fulfilled, (state, action) => {
        state.loading = false;
        state.cardvedio = action.payload || [];
        state.savedCardDetails = action.payload || [];
      })
      .addCase(getSavedCardvedio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch saved cards";
      })

      // ---- getSavedCardBusiness ----
      .addCase(getSavedCardBusiness.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSavedCardBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.cardvedio = action.payload || [];
      })
      .addCase(getSavedCardBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch business cards";
      })

      // ---- deleteSavedCard ----
      .addCase(deleteSavedCard.pending, (state) => {
        state.loading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteSavedCard.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = action.payload.message;
        state.cardvedio = state.cardvedio.filter(
          (card) => card.id !== action.payload.paymentMethodId
        );
        toast.success(action.payload.message);
      })
      .addCase(deleteSavedCard.rejected, (state, action) => {
        state.loading = false;
        state.deleteError = action.payload || "Failed to delete card";
        toast.error(state.deleteError);
      });
  },
});
export const { clearDeleteMessages } = savedCardSlice.actions;
export default savedCardSlice.reducer;
