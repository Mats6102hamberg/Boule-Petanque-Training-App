import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as trainingAPI from '../../services/api/training';

// Async thunks
export const fetchSessions = createAsyncThunk(
  'training/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trainingAPI.getSessions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSession = createAsyncThunk(
  'training/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await trainingAPI.createSession(sessionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const analyzeThrow = createAsyncThunk(
  'training/analyzeThrow',
  async (throwData, { rejectWithValue }) => {
    try {
      const response = await trainingAPI.analyzeThrow(throwData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const trainingSlice = createSlice({
  name: 'training',
  initialState: {
    sessions: [],
    currentSession: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    addThrowToSession: (state, action) => {
      if (state.currentSession) {
        state.currentSession.exercises.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create session
      .addCase(createSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.sessions.unshift(action.payload);
      })
      // Analyze throw
      .addCase(analyzeThrow.fulfilled, (state, action) => {
        if (state.currentSession) {
          state.currentSession = action.payload.session;
        }
      });
  },
});

export const { setCurrentSession, clearCurrentSession, addThrowToSession } = trainingSlice.actions;
export default trainingSlice.reducer;
