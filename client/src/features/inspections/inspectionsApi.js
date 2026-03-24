import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const inspectionsApi = createApi({
  reducerPath: 'inspectionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('frims_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Inspection'],
  endpoints: (builder) => ({
    getInspections: builder.query({
      query: (params) => ({ url: '/inspections', params }),
      providesTags: ['Inspection'],
    }),
    getInspection: builder.query({
      query: (id) => `/inspections/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inspection', id }],
    }),
    createInspection: builder.mutation({
      query: (body) => ({ url: '/inspections', method: 'POST', body }),
      invalidatesTags: ['Inspection'],
    }),
    updateInspection: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/inspections/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inspection', id }],
    }),
    checkIn: builder.mutation({
      query: ({ id, lat, lng }) => ({
        url: `/inspections/${id}/checkin`,
        method: 'POST',
        body: { lat, lng },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inspection', id }],
    }),
    submitChecklist: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/inspections/${id}/checklist`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inspection', id }],
    }),
  }),
});

export const {
  useGetInspectionsQuery,
  useGetInspectionQuery,
  useCreateInspectionMutation,
  useUpdateInspectionMutation,
  useCheckInMutation,
  useSubmitChecklistMutation,
} = inspectionsApi;
