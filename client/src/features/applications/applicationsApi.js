import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('frims_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Application'],
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => ({ url: '/applications', params }),
      providesTags: ['Application'],
    }),
    getApplication: builder.query({
      query: (id) => `/applications/${id}`,
      providesTags: (result, error, id) => [{ type: 'Application', id }],
    }),
    createApplication: builder.mutation({
      query: (body) => ({ url: '/applications', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
    updateApplication: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),
    submitApplication: builder.mutation({
      query: (id) => ({ url: `/applications/${id}/submit`, method: 'POST' }),
      invalidatesTags: ['Application'],
    }),
    reviewApplication: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/${id}/review`, method: 'PUT', body }),
      invalidatesTags: ['Application'],
    }),
    getApplicationStats: builder.query({
      query: () => '/applications/stats',
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useSubmitApplicationMutation,
  useReviewApplicationMutation,
  useGetApplicationStatsQuery,
} = applicationsApi;
