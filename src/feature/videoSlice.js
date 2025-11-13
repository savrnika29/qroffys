import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunk for fetching videos
export const getVideos = createAsyncThunk(
  'videos/getVideos', 
  async ({ token, page = 1, limit = 10, setLoading }, { rejectWithValue }) => {
    try {
      if (setLoading) setLoading(true);
      
      const response = await fetch(`${VITE_API_URL}/posts/videos?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return rejectWithValue(error.message);
    } finally {
      if (setLoading) setLoading(false);
    }
  }
);

// Async thunk for liking a video
export const likeVideo = createAsyncThunk(
  'videos/likeVideo',
  async ({ token, videoId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${VITE_API_URL}/posts/like/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { videoId, data };
    } catch (error) {
      console.error('Error liking video:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for commenting on a video
export const commentVideo = createAsyncThunk(
  'videos/commentVideo',
  async ({ token, videoId, comment }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${VITE_API_URL}/posts/comment/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { videoId, data };
    } catch (error) {
      console.error('Error commenting on video:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for sharing a video
export const shareVideo = createAsyncThunk(
  'videos/shareVideo',
  async ({ token, videoId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${VITE_API_URL}/posts/share/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { videoId, data };
    } catch (error) {
      console.error('Error sharing video:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for saving a video
export const saveVideo = createAsyncThunk(
  'videos/saveVideo',
  async ({ token, videoId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${VITE_API_URL}/posts/save/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { videoId, data };
    } catch (error) {
      console.error('Error saving video:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  videos: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  totalItems: 0,
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearVideos: (state) => {
      state.videos = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    updateVideoInteraction: (state, action) => {
      const { videoId, type, value } = action.payload;
      const videoIndex = state.videos.findIndex(video => video._id === videoId);
      if (videoIndex !== -1) {
        const video = state.videos[videoIndex];
        switch (type) {
          case 'like':
            video.isPostLike = value;
            video.likesCount = value ? video.likesCount + 1 : video.likesCount - 1;
            break;
          case 'save':
            video.isPostSave = value;
            break;
          case 'comment':
            video.commentsCount += 1;
            break;
          case 'share':
            video.sharesCount += 1;
            break;
          default:
            break;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Videos
      .addCase(getVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideos.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload;
        
        if (data && data.stories) {
          const newVideos = data.stories;
          
          if (state.currentPage === 1) {
            state.videos = newVideos;
          } else {
            state.videos = [...state.videos, ...newVideos];
          }
          
          state.totalPages = data.totalPages || 1;
          state.totalItems = data.totalItems || 0;
          state.hasMore = newVideos.length > 0 && state.currentPage < state.totalPages;
        } else {
          state.hasMore = false;
        }
      })
      .addCase(getVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch videos';
        state.hasMore = false;
      })
      
      // Like Video
      .addCase(likeVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const videoIndex = state.videos.findIndex(video => video._id === videoId);
        if (videoIndex !== -1) {
          const video = state.videos[videoIndex];
          video.isPostLike = !video.isPostLike;
          video.likesCount = video.isPostLike ? video.likesCount + 1 : video.likesCount - 1;
        }
      })
      
      // Comment Video
      .addCase(commentVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const videoIndex = state.videos.findIndex(video => video._id === videoId);
        if (videoIndex !== -1) {
          state.videos[videoIndex].commentsCount += 1;
        }
      })
      
      // Share Video
      .addCase(shareVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const videoIndex = state.videos.findIndex(video => video._id === videoId);
        if (videoIndex !== -1) {
          state.videos[videoIndex].sharesCount += 1;
        }
      })
      
      // Save Video
      .addCase(saveVideo.fulfilled, (state, action) => {
        const { videoId } = action.payload;
        const videoIndex = state.videos.findIndex(video => video._id === videoId);
        if (videoIndex !== -1) {
          const video = state.videos[videoIndex];
          video.isPostSave = !video.isPostSave;
        }
      });
  },
});

export const { clearVideos, setCurrentPage, updateVideoInteraction } = videosSlice.actions;
export default videosSlice.reducer;
