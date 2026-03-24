import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const incidentsApi = createApi({
  reducerPath: 'incidentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('frims_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Incident'],
  endpoints: (builder) => ({
    getIncidents: builder.query({
      query: (params) => ({ url: '/incidents', params }),
      providesTags: ['Incident'],
    }),
    getIncident: builder.query({
      query: (id) => `/incidents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Incident', id }],
    }),
    createIncident: builder.mutation({
      query: (body) => ({ url: '/incidents', method: 'POST', body }),
      invalidatesTags: ['Incident'],
    }),
    updateIncident: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/incidents/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Incident', id }],
    }),
    addIncidentUpdate: builder.mutation({
      query: ({ id, message }) => ({ url: `/incidents/${id}/updates`, method: 'POST', body: { message } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Incident', id }],
    }),
    getIncidentStats: builder.query({
      query: () => '/incidents/stats',
    }),
  }),
});

export const {
  useGetIncidentsQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useAddIncidentUpdateMutation,
  useGetIncidentStatsQuery,
} = incidentsApi;
