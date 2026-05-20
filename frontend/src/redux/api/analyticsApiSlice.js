import { apiSlice } from "./apiSlice";

const ANALYTICS_URL = "/api/analytics";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryAnalytics: builder.query({
      query: () => `${ANALYTICS_URL}/inventory`,
      keepUnusedDataFor: 30,
    }),

    getCategoryPredictions: builder.query({
      query: () => `${ANALYTICS_URL}/category-predictions`,
      keepUnusedDataFor: 30,
    }),

    getPriceTrends: builder.query({
      query: () => `${ANALYTICS_URL}/price-trends`,
      keepUnusedDataFor: 30,
    }),

    getProductPriceTrend: builder.query({
      query: (productId) => `${ANALYTICS_URL}/price-trends/${productId}`,
      keepUnusedDataFor: 30,
    }),

    generateKeywords: builder.query({
      query: (productId) => `${ANALYTICS_URL}/keywords/${productId}`,
      keepUnusedDataFor: 5,
    }),

    saveKeywords: builder.mutation({
      query: ({ productId, keywords, metaDescription }) => ({
        url: `${ANALYTICS_URL}/keywords/${productId}`,
        method: "PUT",
        body: { keywords, metaDescription },
      }),
    }),

    getDashboardSummary: builder.query({
      query: () => `${ANALYTICS_URL}/dashboard-summary`,
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetInventoryAnalyticsQuery,
  useGetCategoryPredictionsQuery,
  useGetPriceTrendsQuery,
  useGetProductPriceTrendQuery,
  useGenerateKeywordsQuery,
  useSaveKeywordsMutation,
  useGetDashboardSummaryQuery,
} = analyticsApiSlice;
