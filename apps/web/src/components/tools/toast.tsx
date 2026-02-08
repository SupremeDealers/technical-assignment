"use client";

import { Toaster, toast } from "sonner";

// Define toast types
type ToastType = "success" | "error" | "info" | "loading";

interface ToastData {
  type?: ToastType;
  title: string;
  description?: string;
}

// Toast component
export function ToastComponent() {
  return (
    <Toaster
      position="top-right"
      richColors
      expand={false}
      // closeButton
      toastOptions={{
        className: "toast",
        duration: 3000,
      }}
    />
  );
}

// Function to show a toast
export function showToast(toastData: ToastData) {
  const { type, title, description } = toastData;

  switch (type) {
    case "success":
      toast(title, { description });
      break;
    case "error":
      toast.error(title, { description });
      break;
    case "info":
      toast.info(title, { description });
      break;
    case "loading":
      toast.loading(title, { description });
      break;
    default:
      toast(title, { description });
  }
}
