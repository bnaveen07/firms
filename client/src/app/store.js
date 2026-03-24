import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { applicationsApi } from '../features/applications/applicationsApi';
import { incidentsApi } from '../features/incidents/incidentsApi';
import { nocApi } from '../features/noc/nocApi';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [incidentsApi.reducerPath]: incidentsApi.reducer,
    [nocApi.reducerPath]: nocApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      applicationsApi.middleware,
      incidentsApi.middleware,
      nocApi.middleware
    ),
});

export default store;
