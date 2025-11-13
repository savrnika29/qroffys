import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk for fetching chat users
export const clientChatUsers = createAsyncThunk(
  "chat/clientChatUsers",
  async ({ setLoading }, { rejectWithValue, getState }) => {
    try {
      setLoading(true);
      const { auth } = getState();
      const token = auth.token || localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${VITE_API_URL}/chats/my`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      setLoading(false);

      // toast.success(response?.data?.message);
      return response.data.data;
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch chat users";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching chat messages
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async ({ userId, receiverId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/chats/${userId}/${receiverId}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.messages; // Ensure backend returns { messages: [...] }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch messages";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    loading: false,
    error: null,
    chatList: null,
    loadingUsers: false,
    errorUsers: null,
    lastChatId: localStorage.getItem("lastChatId") || null,
    unreadCounts: {},
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    markMessageRead: (state, action) => {
      const message = state.messages.find(
        (msg) => msg._id === action.payload.messageId
      );
      if (message) message.read = true;
    },
    clearUnreadForUser: (state, action) => {
      const userId = action.payload;
      state.unreadCounts = state.unreadCounts || {}; // Ensure it's an object
      state.unreadCounts[userId] = 0; // Now safe to set
      state.messages = state.messages.map((msg) =>
        msg.senderId === userId && !msg.read ? { ...msg, read: true } : msg
      );
    },
    setLastChatId: (state, action) => {
      state.lastChatId = action.payload;
      localStorage.setItem("lastChatId", action.payload); // Persist to localStorage
    },
    incrementUnreadCount: (state, action) => {
      const userId = action.payload;
      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clientChatUsers.pending, (state) => {
        state.loadingUsers = true;
        state.errorUsers = null;
      })
      .addCase(clientChatUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.chatList = action.payload;
      })
      .addCase(clientChatUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.errorUsers = action.payload;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addMessage,
  markMessageRead,
  clearUnreadForUser,
  incrementUnreadCount,
  setLastChatId,
} = chatSlice.actions;
export default chatSlice.reducer;
