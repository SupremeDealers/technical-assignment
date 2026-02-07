import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { App } from "./ui/App";
import "./index.css";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <App />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
