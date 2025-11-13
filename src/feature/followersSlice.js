import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Normalizer based on type
const normalizeUser = (user, type) => {
  let userId = "";
  let name = "";
  let profilePicture = "";

  if (type === "follower") {
    userId = user.followerId;
    name = user.firstName?user.firstName+" "+user.lastName: user.businessName || "";
    profilePicture = user.profilePicture || user.profilePic || "";
  } else if (type === "following") {
    userId = user.followingId;
    name = user.firstName?user.firstName+" "+user.lastName : user.businessName || "";
    profilePicture = user.profilePicture || user.profilePic || "";
  } else {
    // fallback/default
    userId = user._id;
    name =user.firstName?user.firstName+" "+user.lastName :user.businessName || "";
    profilePicture = user.profilePicture || user.profilePic || "";
  }

  return {
    id: userId,
    _id: userId,
    profilePic: profilePicture,
    name: name,
    firstName: user.firstName || "",

    businessName: user.businessName || "",
    isFollow: user.isFollow || false,
    isFollowing: user.isFollowing || false,
    isMutualFriendWithMe: user.isMutualFriendWithMe || false,
    itsMe: user.itsMe || false,
    role: user?.role,
  };
};

// Fetch followers/following
export const fetchPingers = createAsyncThunk(
  "followers/fetchPingers",
  async (
    { token, userId, targetUserId, type, page = 1, search = "" },
    { rejectWithValue }
  ) => {
    try {
      if (!token) return rejectWithValue("No authentication token provided");
      if (!userId) return rejectWithValue("No authenticated user ID provided");
      if (userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId))
        return rejectWithValue("Invalid authenticated user ID format");
      if (
        targetUserId &&
        (targetUserId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(targetUserId))
      )
        return rejectWithValue("Invalid target user ID format");

      // Use targetUserId if provided, else fall back to userId
      const requestBody = { userId: targetUserId ? targetUserId : "", type };
      if (page > 1) requestBody.page = page.toString();
      if (search.trim()) requestBody.search = search.trim();

      const response = await axios.post(
        `${VITE_API_URL}/followers`,
        requestBody,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.data;

      return {
        ...data,
        page: data.currentPage || page,
        type,
        targetUserId: targetUserId || userId, // Store targetUserId for reference
        totalFollowers: data.totalFollowers || 0,
        totalFollowing: data.totalFollowing || 0,
        followers:
          data.followers?.map((u) => normalizeUser(u, "follower")) || [],
        following:
          data.following?.map((u) => normalizeUser(u, "following")) || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Follow/Unfollow
export const followAction = createAsyncThunk(
  "followers/followAction",
  async ({ token, userId, type }, { rejectWithValue }) => {
    try {
      if (!token) return rejectWithValue("No authentication token provided");
      if (!userId) return rejectWithValue("No user ID provided");
      if (userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId))
        return rejectWithValue("Invalid user ID format");

      const response = await axios.post(
        `${VITE_API_URL}/followers`,
        { userId, type },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { ...response.data, actionType: type, targetUserId: userId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const followerSlice = createSlice({
  name: "followers",
  initialState: {
    pingers: [],
    pinging: [],
    page: 1,
    totalPages: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    targetUserId: null, // New field to track whose data is being viewed
    loading: false,
    error: null,
  },
  reducers: {
    resetFollowerState: (state) => {
      state.pingers = [];
      state.pinging = [];
      state.page = 1;
      state.totalPages = 0;
      state.totalFollowers = 0;
      state.totalFollowing = 0;
      state.targetUserId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPingers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPingers.fulfilled, (state, action) => {
        state.loading = false;
        const {
          followers,
          following,
          totalPages,
          currentPage,
          page,
          type,
          totalFollowers,
          totalFollowing,
          targetUserId,
        } = action.payload;

        state.targetUserId = targetUserId; // Store the target user ID

        const actualPage = currentPage || page || 1;
        state.page = actualPage;
        state.totalPages = totalPages || 0;

        if (type === "following") {
          state.pinging = following ? following : [];
          state.totalFollowing = totalFollowing || 0;
        } else if (type === "follower") {
          state.pingers = followers ? followers : [];
          state.totalFollowers = totalFollowers ? totalFollowers : 0;
        } else if (type === "list") {
          state.totalFollowing = totalFollowing ? totalFollowing : 0;
          state.totalFollowers = totalFollowers ? totalFollowers : 0;
        }
      })
      .addCase(fetchPingers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong.";
      })
      .addCase(followAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followAction.fulfilled, (state, action) => {
        state.loading = false;
        const { actionType, targetUserId } = action.payload;

        if (actionType === "follow" || actionType === "followback") {
          if (!state.pinging.some((user) => user._id === targetUserId)) {
            state.pinging.push({ _id: targetUserId });
            state.totalFollowing += 1;
          }
        } else if (actionType === "unfollow") {
          state.pinging = state.pinging.filter(
            (user) => user._id !== targetUserId
          );
          state.totalFollowing = Math.max(0, state.totalFollowing - 1);
        }
      })
      .addCase(followAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to follow/unfollow.";
      });
  },
});

export const { resetFollowerState } = followerSlice.actions;
export default followerSlice.reducer;
