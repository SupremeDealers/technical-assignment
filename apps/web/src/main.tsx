import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { App } from "./ui/App";
import "./index.css"; 

// Helper to extract the most specific error message
const getErrorMessage = (error: any) => {
  const apiError = error.response?.data?.error;
  if (apiError?.details && Array.isArray(apiError.details) && apiError.details.length > 0) {
    return apiError.details.map((d: any) => d.issue).join(', ');
  }
  if (apiError?.message) {
    return apiError.message;
  }
  return error.message || "Something went wrong";
};

// Global Error Handler Configuration
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${getErrorMessage(error)}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Action Failed: ${getErrorMessage(error)}`);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false, 
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);