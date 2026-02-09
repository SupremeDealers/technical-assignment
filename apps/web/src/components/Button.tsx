import { ReactNode } from "react";
import clsx from "clsx";
import "./Button.css";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx("btn", `btn-${variant}`, `btn-${size}`, className)}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
