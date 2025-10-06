import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import trainingReducer from './slices/trainingSlice';
import socialReducer from './slices/socialSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    training: trainingReducer,
    social: socialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorera vissa actions för serializable check
        ignoredActions: ['training/setCurrentSession'],
      },
    }),
});

export default store;
