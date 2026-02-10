import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "./Router";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
