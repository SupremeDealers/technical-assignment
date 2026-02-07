import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { cn } from "../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type LoadingStateProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingState({
  label = "Loading...",
  className,
  size = "md",
}: LoadingStateProps) {
  const sizeClass = size === "sm" ? "size-3" : size === "lg" ? "size-6" : "size-4";
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}
      aria-live="polite"
    >
      <Spinner className={sizeClass} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  message,
  title = "Something went wrong",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("my-4", className)} role="alert">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry} className="w-fit">
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

type EmptyStateProps = {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon ?? <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      {action}
    </div>
  );
}
