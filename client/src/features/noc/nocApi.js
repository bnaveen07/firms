import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const nocApi = createApi({
  reducerPath: 'nocApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('frims_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['NOC'],
  endpoints: (builder) => ({
    getCertificates: builder.query({
      query: (params) => ({ url: '/noc', params }),
      providesTags: ['NOC'],
    }),
    getCertificate: builder.query({
      query: (id) => `/noc/${id}`,
      providesTags: (result, error, id) => [{ type: 'NOC', id }],
    }),
    issueCertificate: builder.mutation({
      query: ({ applicationId, ...body }) => ({
        url: `/noc/issue/${applicationId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NOC'],
    }),
    revokeCertificate: builder.mutation({
      query: ({ id, reason }) => ({ url: `/noc/${id}/revoke`, method: 'PUT', body: { reason } }),
      invalidatesTags: ['NOC'],
    }),
    verifyCertificate: builder.query({
      query: (token) => `/noc/verify/${token}`,
    }),
  }),
});

export const {
  useGetCertificatesQuery,
  useGetCertificateQuery,
  useIssueCertificateMutation,
  useRevokeCertificateMutation,
  useVerifyCertificateQuery,
} = nocApi;
