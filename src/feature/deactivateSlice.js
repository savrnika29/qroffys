import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;


export const deactivateAccount = createAsyncThunk(
  "account/deactivate",
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${VITE_API_URL}/users/account-deactivations`, {
        method: "PATCH",
        headers: {
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload), 
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { response: { data: err, status: res.status } };
      }

      const result = await res.json();
      toast.success(result?.message || "Account deactivated successfully");
      return result;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Something went wrong"
      );
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState: {
    deactivationResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetDeactivationState: (state) => {
      state.deactivationResult = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deactivateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateAccount.fulfilled, (state, action) => {
        state.deactivationResult = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(deactivateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDeactivationState } = accountSlice.actions;
export default accountSlice.reducer;
