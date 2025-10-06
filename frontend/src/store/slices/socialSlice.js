import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as socialAPI from '../../services/api/social';

export const fetchFriends = createAsyncThunk(
  'social/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getFriends();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'social/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getLeaderboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState: {
    friends: [],
    leaderboard: [],
    challenges: [],
    loading: false,
    error: null,
  },
  reducers: {
    addChallenge: (state, action) => {
      state.challenges.push(action.payload);
    },
    removeChallenge: (state, action) => {
      state.challenges = state.challenges.filter(
        c => c.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      });
  },
});

export const { addChallenge, removeChallenge } = socialSlice.actions;
export default socialSlice.reducer;
